import json
from django.core.management.base import BaseCommand
from django.conf import settings
from dictionary.models import Word, Tag

class Command(BaseCommand):
    help = 'Import words from a static JSON file'

    def handle(self, *args, **options):
        file_path = settings.BASE_DIR / 'dictionary' / 'static' / 'dictionary' / 'words.json'
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                words_data = json.load(f)
            
            imported_count = 0
            for item in words_data:
                word, created = Word.objects.get_or_create(
                    term=item['term'][:200],
                    defaults={
                        'description': item.get('formatted-description', ''),
                        'source': item.get('source', '')
                    }
                )
                # Handle tags
                if item.get('tags'):
                    for tag_name in item['tags']:
                        # Get or create the tag
                        tag, tag_created = Tag.objects.get_or_create(name=tag_name)
                        # Add the tag to the word
                        word.tags.add(tag)

                if created:
                    imported_count += 1
            
            self.stdout.write(
                self.style.SUCCESS(f'Successfully imported {imported_count} new words')
            )
        except FileNotFoundError:
            self.stdout.write(
                self.style.ERROR(f'File not found: {file_path}')
            )
        except json.JSONDecodeError:
            self.stdout.write(
                self.style.ERROR('Invalid JSON format in words.json')
            )