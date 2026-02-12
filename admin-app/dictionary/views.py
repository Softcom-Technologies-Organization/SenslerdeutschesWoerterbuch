import os
from django.shortcuts import render

# Create your views here.
from django.http import HttpResponse, JsonResponse
from opensearchpy import OpenSearch


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
    query_term = request.GET.get('q', '')
    client = get_client()
    try:
        resp = client.search(index='dictionary', q=query_term)
        return JsonResponse(resp)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
