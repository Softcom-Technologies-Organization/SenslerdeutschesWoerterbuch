# AI generated
import json
import os
from pathlib import Path

from opensearchpy import OpenSearch
from opensearchpy.helpers import bulk

from .models import Word


def get_index_name() -> str:
    return os.getenv('OPENSEARCH_INDEX_NAME')


def get_client() -> OpenSearch:
    host = os.getenv('OPENSEARCH_HOST')
    port = 9200
    username = 'admin'
    password = os.getenv('OPENSEARCH_ADMIN_PASSWORD')
    auth = (username, password)
    return OpenSearch(
        hosts=[{'host': host, 'port': port}],
        http_auth=auth,
        use_ssl=False,
        verify_certs=False,
        timeout=2,
        max_retries=0,
        retry_on_timeout=False,
    )


def load_index_config() -> dict:
    config_path = settings.BASE_DIR / 'dictionary' / 'static' / 'dictionary' / 'index.json'
    with open(config_path, 'r', encoding='utf-8') as config_file:
        return json.load(config_file)


def reset_index(client: OpenSearch, index_name: str) -> None:
    if client.indices.exists(index=index_name):
        client.indices.delete(index=index_name)

    index_config = load_index_config()
    client.indices.create(index=index_name, body=index_config)


def generate_word_actions(index_name: str):
    for word in Word.objects.prefetch_related('tags').all():
        yield {
            '_index': index_name,
            '_id': word.id,
            '_source': {
                'id': word.id,
                'term': word.term,
                'description': word.description,
                'formatted-description': word.description,
                'source': word.source,
                'tags': [
                    {'name': tag.name, 'display_name': tag.display_name or tag.name}
                    for tag in word.tags.all()
                ],
            },
        }


def sync_words(client: OpenSearch, index_name: str) -> tuple[int, int]:
    return bulk(client, generate_word_actions(index_name), stats_only=True)


def get_index_status(client: OpenSearch, index_name: str) -> tuple[bool, int]:
    exists = client.indices.exists(index=index_name)
    if not exists:
        return False, 0

    count_response = client.count(index=index_name)
    return True, count_response.get('count', 0)