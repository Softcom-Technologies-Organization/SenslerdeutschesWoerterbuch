import json
from .models import Word


def build_export_payload() -> list[dict]:
    words = Word.objects.prefetch_related('tags').order_by('term', 'id')
    return [
        {
            'term': word.term,
            'description': word.description,
            'sources': word.source,
            'tags': [
                {'name': tag.name, 'display_name': tag.display_name or tag.name}
                for tag in sorted(word.tags.all(), key=lambda t: t.name)
            ],
        }
        for word in words
    ]


def export_words_json() -> str:
    return json.dumps(build_export_payload(), ensure_ascii=False, indent=4) + '\n'
