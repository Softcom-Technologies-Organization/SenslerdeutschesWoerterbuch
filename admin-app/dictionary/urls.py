from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("search/query", views.search, name="search"),
    path('search/status', views.check_searchengine_status, name='searchengine_status'),
    path('search/random', views.search_random, name='search_random'),
    path('search/tags', views.get_tags, name='get_tags'),
    path('word/<int:pk>/', views.word_detail, name='word_detail'),
]