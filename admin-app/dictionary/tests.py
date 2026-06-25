import shutil
import tempfile

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from django.urls import reverse

from .models import Pronunciation, Word

_TEMP_MEDIA_ROOT = tempfile.mkdtemp()


@override_settings(MEDIA_ROOT=_TEMP_MEDIA_ROOT)
class WordDetailPronunciationTests(TestCase):
    @classmethod
    def tearDownClass(cls):
        shutil.rmtree(_TEMP_MEDIA_ROOT, ignore_errors=True)
        super().tearDownClass()

    def test_word_detail_includes_pronunciations(self):
        word = Word.objects.create(term='Beize', description='Wirtschaft')
        Pronunciation.objects.create(
            word=word,
            audio_file=SimpleUploadedFile('a.mp3', b'fake-audio', content_type='audio/mpeg'),
            label='Oberland',
            order=0,
        )

        response = self.client.get(reverse('word_detail', args=[word.pk]))
        self.assertEqual(response.status_code, 200)

        data = response.json()
        self.assertEqual(len(data['pronunciations']), 1)
        self.assertEqual(data['pronunciations'][0]['label'], 'Oberland')
        self.assertTrue(data['pronunciations'][0]['url'].startswith('/media/pronunciations/'))

    def test_word_detail_without_pronunciations(self):
        word = Word.objects.create(term='Beize', description='Wirtschaft')

        response = self.client.get(reverse('word_detail', args=[word.pk]))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['pronunciations'], [])
