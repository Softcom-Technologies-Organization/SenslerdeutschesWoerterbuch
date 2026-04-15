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

            # Collect all unique tag names and resolve them upfront
            all_tag_names = set()
            for item in words_data:
                if item.get('tags'):
                    all_tag_names.update(item['tags'])

            tag_map = {}
            for tag_name in all_tag_names:
                tag, _ = Tag.objects.get_or_create(
                    name=tag_name,
                    defaults={'display_name': self.get_tag_display_name(tag_name)},
                )
                if not tag.display_name:
                    tag.display_name = self.get_tag_display_name(tag_name)
                    tag.save(update_fields=['display_name'])
                tag_map[tag_name] = tag

            # Bulk-create all Word rows in one query
            words_to_create = [
                Word(
                    term=item['term'][:200],
                    description=item.get('description', ''),
                    source=item.get('sources', ''),
                )
                for item in words_data
            ]
            created_words = Word.objects.bulk_create(words_to_create)

            # Bulk-create all M2M through-table rows
            WordTag = Word.tags.through
            word_tags = []
            for word, item in zip(created_words, words_data):
                for tag_name in item.get('tags') or []:
                    word_tags.append(WordTag(word_id=word.pk, tag_id=tag_map[tag_name].pk))
            if word_tags:
                WordTag.objects.bulk_create(word_tags)

            self.stdout.write(
                self.style.SUCCESS(f'Successfully imported {len(created_words)} words')
            )
        except FileNotFoundError:
            self.stderr.write(
                self.style.ERROR(f'File not found: {file_path}')
            )
        except json.JSONDecodeError:
            self.stderr.write(
                self.style.ERROR('Invalid JSON format in words.json')
            )