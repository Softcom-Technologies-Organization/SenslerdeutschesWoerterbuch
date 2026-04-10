# AI generated
import json
from django.core.management.base import BaseCommand
from django.conf import settings
from dictionary.models import Word, Tag


TAG_DISPLAY_NAMES = {
    'curse-word': 'Schimpfwort',
}


class Command(BaseCommand):
    help = 'Import words from a static JSON file'

    @staticmethod
    def get_tag_display_name(tag_name):
        return TAG_DISPLAY_NAMES.get(tag_name, tag_name.replace('-', ' ').title())

    def handle(self, *args, **options):
        file_path = settings.BASE_DIR / 'dictionary' / 'static' / 'dictionary' / 'words.json'
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                words_data = json.load(f)
            
            self.stdout.write('Deleting all existing words...')
            Word.objects.all().delete()

            imported_count = 0
            for item in words_data:
                word = Word.objects.create(
                    term=item['term'][:200],
                    description=item.get('description', ''),
                    source=item.get('sources', '')
                )

                if item.get('tags'):
                    for tag_name in item['tags']:
                        tag, _ = Tag.objects.get_or_create(name=tag_name)
                        if not tag.display_name:
                            tag.display_name = self.get_tag_display_name(tag_name)
                            tag.save(update_fields=['display_name'])
                        word.tags.add(tag)

                imported_count += 1
            
            self.stdout.write(
                self.style.SUCCESS(f'Successfully imported {imported_count} words')
            )
        except FileNotFoundError:
            self.stderr.write(
                self.style.ERROR(f'File not found: {file_path}')
            )
        except json.JSONDecodeError:
            self.stderr.write(
                self.style.ERROR('Invalid JSON format in words.json')
            )