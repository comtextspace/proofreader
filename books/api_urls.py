from rest_framework import routers

import books.api_views

urlpatterns = []
books_router = routers.DefaultRouter(trailing_slash=False)
books_router.register('', books.api_views.BooksViewset, basename='books')

urlpatterns += books_router.urls
