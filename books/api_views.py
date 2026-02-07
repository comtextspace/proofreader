from django.conf import settings
from django.http import HttpResponse
from django_filters import rest_framework as django_filters
from rest_framework import filters, mixins, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from books.models import Book, Page
from books.serializers import (
    BookListSerializer,
    PageAdjacentSerializer,
    PageDetailSerializer,
    PageHistorySerializer,
    PageListSerializer,
    PageUpdateSerializer,
)
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


class BookListViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = BookListSerializer
    lookup_field = 'id'
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'author__name']
    ordering_fields = ['name']
    ordering = ['name']

    def get_queryset(self):
        from django.db.models import Count, Q

        return Book.objects.select_related('author').annotate(
            pages_count=Count('pages'),
            pages_done_count=Count('pages', filter=Q(pages__status=Page.Status.DONE)),
        )


class PageFilter(django_filters.FilterSet):
    book = django_filters.UUIDFilter(field_name='book__id')
    status = django_filters.CharFilter(field_name='status')
    assigned = django_filters.BooleanFilter(method='filter_assigned')

    class Meta:
        model = Page
        fields = ['book', 'status']

    def filter_assigned(self, queryset, name, value):
        if value and self.request and self.request.user.is_authenticated:
            return queryset.user_assignments(self.request.user)
        return queryset


class PagesViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'
    filter_backends = [django_filters.DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    filterset_class = PageFilter
    search_fields = ['number', 'number_in_book']
    ordering_fields = ['number', 'modified', 'book__name']
    ordering = ['book__name', 'number']

    def get_queryset(self):
        return Page.objects.select_related('book', 'book__author').order_by('book__name', 'number')

    def get_serializer_class(self, **kwargs):
        if self.action == 'list':
            return PageListSerializer
        if self.action in ('partial_update', 'update'):
            return PageUpdateSerializer
        return PageDetailSerializer

    def update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return super().update(request, *args, **kwargs)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = PageDetailSerializer(instance, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def adjacent(self, request, id=None):
        page = self.get_object()
        book_pages = Page.objects.filter(book=page.book).order_by('number')

        prev_page = book_pages.filter(number__lt=page.number).order_by('-number').first()
        next_page = book_pages.filter(number__gt=page.number).order_by('number').first()

        serializer = PageAdjacentSerializer(
            {
                'prev_id': prev_page.id if prev_page else None,
                'next_id': next_page.id if next_page else None,
            }
        )
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def history(self, request, id=None):
        page = self.get_object()
        history = page.history.select_related('history_user').order_by('-history_date')[:50]
        serializer = PageHistorySerializer(history, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def correct(self, request, id=None):
        page = self.get_object()

        if not settings.LLM_CORRECTION_ENABLED:
            return Response({'detail': 'LLM correction is not enabled.'}, status=400)

        from books.tasks import correct_text_with_llm_task

        correct_text_with_llm_task.delay(page.id)
        return Response({'detail': 'LLM correction task started.'})
