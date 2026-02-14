import os
from django.core.management.base import BaseCommand
from opensearchpy import OpenSearch
from opensearchpy.helpers import bulk
from dictionary.models import Word

class Command(BaseCommand):
    help = 'Populate OpenSearch index with data from database'

    def handle(self, *args, **options):
        HOST = os.getenv('OPENSEARCH_HOST', 'opensearch')
        URL = f"http://{HOST}:9200"
        AUTH = ('admin', os.getenv('OPENSEARCH_ADMIN_PASSWORD', 'ComplexPassword123!'))
        INDEX_NAME = os.getenv('ELASTIC_INDEX', 'dictionary')

        self.stdout.write(f"Connecting to OpenSearch at {URL}...")
        client = OpenSearch(hosts=[URL], http_auth=AUTH)

        self.stdout.write("Indexing words from database...")
        
        def generate_actions():
            # Use prefetch_related to avoid N+1 queries for tags
            for word in Word.objects.prefetch_related('tags').all():
                yield {
                    "_index": INDEX_NAME,
                    "_id": word.id,
                    "_source": {
                        "id": word.id,
                        "term": word.term,
                        "description": word.description,
                        "source": word.source,
                        "tags": [tag.name for tag in word.tags.all()]
                    }
                }

        success, failed = bulk(client, generate_actions(), stats_only=True)
        if failed:
            self.stdout.write(self.style.WARNING(f"Indexed {success} documents with {failed} errors."))
        else:
            self.stdout.write(self.style.SUCCESS(f"Successfully indexed {success} documents."))