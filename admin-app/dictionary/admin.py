import io
from django.contrib import admin
from django.urls import path
from django.http import HttpResponseRedirect
from django.core.management import call_command
from django.contrib import messages
from .models import Word, Tag

@admin.register(Word)
class WordAdmin(admin.ModelAdmin):
    list_display = ('term', 'description', 'source')
    search_fields = ('term', 'description')
    filter_horizontal = ('tags',)

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('sync-search/', self.admin_site.admin_view(self.sync_search), name='dictionary_word_sync_search'),
            path('init-search/', self.admin_site.admin_view(self.init_search), name='dictionary_word_init_search'),
            path('import-words/', self.admin_site.admin_view(self.import_words), name='dictionary_word_import_words'),
        ]
        return custom_urls + urls

    def sync_search(self, request):
        try:
            out = io.StringIO()
            call_command('sync_search', stdout=out)
            self.message_user(request, f"Sync successful: {out.getvalue()}", messages.SUCCESS)
        except Exception as e:
            self.message_user(request, f"Sync failed: {str(e)}", messages.ERROR)
        return HttpResponseRedirect("../")

    def init_search(self, request):
        try:
            out = io.StringIO()
            call_command('init_search', stdout=out)
            self.message_user(request, f"Init successful: {out.getvalue()}", messages.SUCCESS)
        except Exception as e:
            self.message_user(request, f"Init failed: {str(e)}", messages.ERROR)
        return HttpResponseRedirect("../")
    
    def import_words(self, request):
        try:
            out = io.StringIO()
            call_command('import_words', stdout=out)
            self.message_user(request, f"Import successful: {out.getvalue()}", messages.SUCCESS)
        except Exception as e:
            self.message_user(request, f"Import failed: {str(e)}", messages.ERROR)
        return HttpResponseRedirect("../")

@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ('name', 'display_name')