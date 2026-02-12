from django.contrib import admin
from .models import Tag, Word

# TODO: Improve UI using django admin customizations, e.g. search_fields, filter_horizontal etc.
admin.site.register(Word)
admin.site.register(Tag)