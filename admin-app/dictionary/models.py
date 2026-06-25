from typing import TYPE_CHECKING, Any

from django.core.exceptions import ValidationError
from django.core.validators import FileExtensionValidator
from django.db import models


class Tag(models.Model):
    name = models.CharField(max_length=100, unique=True)
    display_name = models.CharField(max_length=100, default='', blank=True)

    def __str__(self):
        return self.display_name or self.name


class Word(models.Model):
    term = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    source = models.TextField(blank=True)
    tags = models.ManyToManyField(Tag, blank=True)

    def __str__(self):
        return self.term

    def to_dict(self):
        return {
            "id": self.id,
            "term": self.term,
            "description": self.description,
            "source": self.source,
            "tags": [{"name": tag.name, "display_name": tag.display_name or tag.name} for tag in self.tags.all()],
            "pronunciations": [p.to_dict() for p in self.pronunciations.all()],
        }


ALLOWED_AUDIO_EXTENSIONS = ['mp3', 'm4a', 'ogg', 'wav', 'webm']
MAX_AUDIO_FILE_SIZE_MB = 10


def validate_audio_file_size(file):
    limit = MAX_AUDIO_FILE_SIZE_MB * 1024 * 1024
    if file.size > limit:
        raise ValidationError(f'Audio file too large. Maximum size is {MAX_AUDIO_FILE_SIZE_MB} MB.')


class Pronunciation(models.Model):
    word = models.ForeignKey(Word, related_name='pronunciations', on_delete=models.CASCADE)
    audio_file = models.FileField(
        upload_to='pronunciations/',
        validators=[
            FileExtensionValidator(allowed_extensions=ALLOWED_AUDIO_EXTENSIONS),
            validate_audio_file_size,
        ],
    )
    label = models.CharField(max_length=200, blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return f'{self.word.term} ({self.label})' if self.label else self.word.term

    def to_dict(self):
        return {
            'url': self.audio_file.url if self.audio_file else None,
            'label': self.label,
        }
