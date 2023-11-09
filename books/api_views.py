from django.http import HttpResponse
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated

from books.models import Book
from books.services.book_export import export_book
from core.base_classes.views import ParentViewSet


class BooksViewset(ParentViewSet):
    queryset = Book.objects.all()
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'

    @action(detail=True, methods=['get'])
    def download(self, request, id=None):
        book = self.get_object()
        text = export_book(book)
        response = HttpResponse(text, content_type='text/plain')
        response['Content-Disposition'] = f'attachment; filename="{book.name}.md"'
        return response
