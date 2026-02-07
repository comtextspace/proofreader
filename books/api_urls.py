from rest_framework import routers

import books.api_views

urlpatterns = []

books_router = routers.DefaultRouter(trailing_slash=False)
books_router.register('', books.api_views.BooksViewset, basename='books')

book_list_router = routers.DefaultRouter(trailing_slash=False)
book_list_router.register('', books.api_views.BookListViewSet, basename='book-list')

pages_router = routers.DefaultRouter(trailing_slash=False)
pages_router.register('', books.api_views.PagesViewSet, basename='pages')

urlpatterns += books_router.urls
