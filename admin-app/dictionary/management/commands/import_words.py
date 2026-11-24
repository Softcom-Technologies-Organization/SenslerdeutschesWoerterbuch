# AI generated
import json
from django.core.management.base import BaseCommand
from django.conf import settings
from django.db import transaction
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

            # Collect unique tag names and optional explicit display names
            # (supports both legacy string tags and exported {"name", "display_name"} objects)
            tag_display_map = {}
            for item in words_data:
                for raw_tag in item.get('tags') or []:
                    if isinstance(raw_tag, dict):
                        name = raw_tag['name']
                        display_name = raw_tag.get('display_name') or self.get_tag_display_name(name)
                        tag_display_map[name] = display_name
                    else:
                        tag_display_map.setdefault(raw_tag, None)

            with transaction.atomic():
                self.stdout.write('Deleting all existing words...')
                Word.objects.all().delete()

                tag_map = {}
                for tag_name, explicit_display_name in tag_display_map.items():
                    if explicit_display_name is not None:
                        tag, _ = Tag.objects.update_or_create(
                            name=tag_name,
                            defaults={'display_name': explicit_display_name},
                        )
                    else:
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
                        source=item.get('sources', item.get('source', '')),
                    )
                    for item in words_data
                ]
                created_words = Word.objects.bulk_create(words_to_create)

                # Bulk-create all M2M through-table rows
                WordTag = Word.tags.through
                word_tags = []
                for word, item in zip(created_words, words_data):
                    seen_tags = set()
                    for raw_tag in item.get('tags') or []:
                        tag_name = raw_tag['name'] if isinstance(raw_tag, dict) else raw_tag
                        if tag_name not in seen_tags:
                            seen_tags.add(tag_name)
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