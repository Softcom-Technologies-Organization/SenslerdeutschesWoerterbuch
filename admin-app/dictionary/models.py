from django.db import models


class Tag(models.Model):
    name = models.CharField(max_length=100, unique=True)
    display_name = models.CharField(max_length=100, default='', blank=True)

    def __str__(self):
        return self.display_name or self.name


class Word(models.Model):
    term = models.CharField(max_length=200, unique=True)
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
            "tags": list(self.tags.values_list('name', flat=True)),
        }
