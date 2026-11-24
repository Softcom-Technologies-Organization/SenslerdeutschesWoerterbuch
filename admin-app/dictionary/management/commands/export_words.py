from django.core.management.base import BaseCommand
from dictionary.export_helper import export_words_json


class Command(BaseCommand):
    help = 'Export all words and tags to JSON'

    def handle(self, *args, **options):
        self.stdout.write(export_words_json(), ending='')
