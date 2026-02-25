import re
from django.shortcuts import get_object_or_404
from django.http import HttpResponse, JsonResponse
from opensearchpy import exceptions as os_exc
from .models import Word, Tag
from .opensearch_helper import get_client, get_index_name, get_index_status


def _sanitize_query(raw: str) -> str:
    """Strip whitespace and remove characters that could break query parsing."""
    text = raw.strip()[:200]  # limit length
    # Remove characters that are special in query_string syntax (safety net)
    text = re.sub(r'[+\-=&|><!(){}\[\]^"~*?:\\/]', ' ', text)
    # Collapse multiple spaces
    text = re.sub(r'\s+', ' ', text).strip()
    return text

@require_GET
def check_searchengine_status(request):
    try:
        client = get_client()
        if not client.ping():
            return JsonResponse({'status': 'unavailable', 'indexExists': False, 'docCount': 0}, status=503)

        index_exists, doc_count = get_index_status(client, get_index_name())
        return JsonResponse({'status': 'available', 'indexExists': index_exists, 'docCount': doc_count})
    except (os_exc.ConnectionTimeout, os_exc.ConnectionError, TimeoutError):
        return JsonResponse({'status': 'unavailable', 'indexExists': False, 'docCount': 0}, status=503)
    except Exception as e:
        return JsonResponse({'status': 'unavailable', 'error': str(e), 'indexExists': False, 'docCount': 0}, status=503)

@require_GET
def search(request):
    raw_term = request.GET.get('term', '')
    query_term = _sanitize_query(raw_term)
    tags = request.GET.getlist('tags')
    random_mode = request.GET.get('random') == 'true'
    client = get_client()

    query = {
        "bool": {
            "must": [],
            "filter": []
        }
    }

    if query_term:
        # Use a bool/should with field-specific match queries so that
        # the custom analyzers (edge_ngram, phonetic, asciifolding) are
        # actually used.  Each clause has a different boost so that exact
        # term matches rank highest, then fuzzy, then phonetic, then
        # description.
        query["bool"]["must"].append({
            "bool": {
                "should": [
                    {
                        "match": {
                            "term": {
                                "query": query_term,
                                "boost": 10,
                                "analyzer": "term_search_analyzer"
                            }
                        }
                    },
                    {
                        "match": {
                            "term": {
                                "query": query_term,
                                "fuzziness": "AUTO",
                                "boost": 5,
                                "analyzer": "term_search_analyzer"
                            }
                        }
                    },
                    {
                        "match": {
                            "term.phonetic": {
                                "query": query_term,
                                "boost": 2
                            }
                        }
                    },
                    {
                        "match": {
                            "formatted-description": {
                                "query": query_term,
                                "boost": 1
                            }
                        }
                    }
                ],
                "minimum_should_match": 1
            }
        })
    else:
        query["bool"]["must"].append({"match_all": {}})

    if tags:
        query["bool"]["filter"].append({"terms": {"tags.name.keyword": tags}})
        
    final_query = query
    if random_mode:
        final_query = {
            "function_score": {
                "query": query,
                "random_score": {},
                "boost_mode": "replace"
            }
        }

    try:
        # log the final query for debugging purposes
        print("Final OpenSearch query:", final_query)
        resp = client.search(
            index=get_index_name(),
            body={"query": final_query, "size": 10}
        )
        return JsonResponse(resp)
    except (os_exc.ConnectionTimeout, os_exc.ConnectionError, TimeoutError):
        return JsonResponse({"detail": "Search temporarily unavailable"}, status=503)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@require_GET    
def search_random(request):
    tags = request.GET.getlist('tags', [])
    if tags:
        word = Word.objects.filter(tags__name__in=tags).order_by('?').first()
    else:
        word = Word.objects.order_by('?').first()
    return JsonResponse(word.to_dict() if word else None)

@require_GET
def get_tags(request):
    tags = Tag.objects.all()
    tag_list = [{'name': tag.name, 'display_name': tag.display_name or tag.name} for tag in tags]
    return JsonResponse(tag_list, safe=False)

@require_GET    
def word_detail(request, pk):
    word = get_object_or_404(Word, pk=pk)
    return JsonResponse({
        'id': word.id,
        'term': word.term,
        'description': word.description,
        # Mapping description to formatted-description for frontend compatibility
        'formatted-description': word.description,
        'source': word.source,
        'tags': [tag.name for tag in word.tags.all()]
    })