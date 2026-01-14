from django.db import models

class Word(models.Model):
    term = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    source = models.TextField(blank=True)

    def __str__(self):
        return self.term