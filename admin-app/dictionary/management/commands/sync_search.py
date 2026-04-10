# AI generated
from django.core.management.base import BaseCommand
from dictionary.opensearch_helper import get_client, get_index_name, reset_index, sync_words

class Command(BaseCommand):
    help = 'Reset OpenSearch index and sync all words from database'

    def handle(self, *args, **options):
        client = get_client()
        index_name = get_index_name()

        self.stdout.write(f"Resetting index '{index_name}'...")
        reset_index(client, index_name)
        self.stdout.write(self.style.SUCCESS(f"Index '{index_name}' recreated."))

        self.stdout.write("Syncing words from database...")
        success, failed = sync_words(client, index_name)

        if failed:
            self.stdout.write(self.style.WARNING(f"Indexed {success} documents with {failed} errors."))
        else:
            self.stdout.write(self.style.SUCCESS(f"Successfully indexed {success} documents."))