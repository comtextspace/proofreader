from django.urls import path

from .views import HomePageView, BookListView, BookView, PageListView, PageView

urlpatterns = [
    path("", HomePageView.as_view(), name="home"),
    path("book", BookListView.as_view(), name="book_list"),
    path("book/<uuid:id>", BookView.as_view(), name="book_detail"),
    path("book/<uuid:id>/page", PageListView.as_view(), name="page_list"),
    path(
        "book/<uuid:book_id>/page/<uuid:page_id>",
        PageView.as_view(),
        name="page_detail",
    ),
]
