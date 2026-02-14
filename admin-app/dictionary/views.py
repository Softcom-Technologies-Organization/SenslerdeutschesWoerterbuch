import os
from django.shortcuts import get_object_or_404
from django.http import HttpResponse, JsonResponse
from opensearchpy import OpenSearch
from .models import Word, Tag


def get_client():
    host = os.getenv('OPENSEARCH_HOST', 'opensearch')
    port = int(os.getenv('OPENSEARCH_PORT', '9200'))
    username = os.getenv('OPENSEARCH_ADMIN_USERNAME', 'admin')
    password = os.getenv('OPENSEARCH_ADMIN_PASSWORD', 'admin')
    auth = (username, password)
    return OpenSearch(
        hosts=[{'host': host, 'port': port}],
        http_auth=auth,
        use_ssl=False,
        verify_certs=False
    )


def index(request):
    return HttpResponse("Hello, world. You're at the dictionaries index.")


def search(request):
    query_term = request.GET.get('term', '')
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
        query["bool"]["must"].append({"query_string": {"query": query_term}})
    else:
        query["bool"]["must"].append({"match_all": {}})

    if tags:
        query["bool"]["filter"].append({"terms": {"tags.keyword": tags}})
        
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
        resp = client.search(index='dictionary', body={"query": final_query})
        return JsonResponse(resp)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
    
def search_random(request):
    tags = request.GET.getlist('tags', [])
    if tags:
        word = Word.objects.filter(tags__name__in=tags).order_by('?').first()
    else:
        word = Word.objects.order_by('?').first()
    return JsonResponse(word.to_dict() if word else None)

def get_tags(request):
    tags = Tag.objects.all()
    tag_list = [{'name': tag.name, 'display_name': tag.display_name or tag.name} for tag in tags]
    return JsonResponse(tag_list, safe=False)
    
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

def check_searchengine_status(request):
    try:
        client = get_client()
        if client.ping():
            return JsonResponse({'status': 'available'})
        else:
            return JsonResponse({'status': 'unavailable'}, status=503)
    except Exception as e:
        return JsonResponse({'status': 'unavailable', 'error': str(e)}, status=503)