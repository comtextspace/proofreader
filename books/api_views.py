import hashlib
import json

from django.conf import settings
from django.core.cache import cache
from django.db.models import Count, Q
from django.http import HttpResponse
from django_filters import rest_framework as django_filters
from rest_framework import filters, mixins, viewsets
from rest_framework.decorators import action
from rest_framework.pagination import LimitOffsetPagination
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.response import Response

from books.cache import get_pages_list_cache_version
from books.models import Author, Book, Bookmark, Page
from books.serializers import (
    AuthorCreateSerializer,
    AuthorListSerializer,
    BookCreateSerializer,
    BookDetailSerializer,
    BookListSerializer,
    BookmarkCreateSerializer,
    BookmarkSerializer,
    BookPageHistorySerializer,
    PageAdjacentSerializer,
    PageDetailSerializer,
    PageHistorySerializer,
    PageListSerializer,
    PageUpdateSerializer,
)
from books.services.book_export import export_book, export_book_as_epub, export_book_as_pdf
from core.base_classes.views import ParentViewSet


class AuthorViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    lookup_field = 'id'
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name']
    ordering_fields = ['name']
    ordering = ['name']

    def get_permissions(self):
        if self.action == 'create':
            return [IsAdminUser()]
        return [IsAuthenticated()]

    def get_serializer_class(self):
        if self.action == 'create':
            return AuthorCreateSerializer
        return AuthorListSerializer

    def get_queryset(self):
        return Author.objects.annotate(books_count=Count('books'))


class BooksViewset(ParentViewSet):
    queryset = Book.objects.filter(is_hidden=False)
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'

    @action(detail=True, methods=['get'])
    def download(self, request, id=None):
        book = self.get_object()
        text = export_book(book)
        response = HttpResponse(text, content_type='text/plain')
        response['Content-Disposition'] = f'attachment; filename="{book.name}.md"'
        return response


class BookFilter(django_filters.FilterSet):
    author = django_filters.UUIDFilter(field_name='author__id')

    class Meta:
        model = Book
        fields = ['author']


class BookListViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    lookup_field = 'id'
    filter_backends = [django_filters.DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = BookFilter
    search_fields = ['name', 'author__name']
    ordering_fields = ['name']
    ordering = ['name']

    def get_permissions(self):
        if self.action == 'create':
            return [IsAdminUser()]
        return [IsAuthenticated()]

    def get_serializer_class(self):
        if self.action == 'create':
            return BookCreateSerializer
        if self.action == 'retrieve':
            return BookDetailSerializer
        return BookListSerializer

    def get_queryset(self):
        return (
            Book.objects.filter(is_hidden=False)
            .select_related('author')
            .annotate(
                pages_count=Count('pages'),
                pages_done_count=Count('pages', filter=Q(pages__status=Page.Status.DONE)),
                pages_processing_count=Count('pages', filter=Q(pages__status=Page.Status.PROCESSING)),
                pages_recognized_count=Count('pages', filter=Q(pages__status=Page.Status.READY)),
                pages_in_work_count=Count(
                    'pages',
                    filter=Q(pages__status__in=[Page.Status.IN_PROGRESS, Page.Status.FORMATTING, Page.Status.CHECK]),
                ),
            )
        )

    @action(detail=True, methods=['get'], url_path='download-text')
    def download_text(self, request, id=None):
        book = self.get_object()
        if book.is_locked:
            return Response({'detail': 'Книга заблокирована для экспорта.'}, status=403)
        text = export_book(book)
        response = HttpResponse(text, content_type='text/plain')
        response['Content-Disposition'] = f'attachment; filename="{book.name}.md"'
        return response

    @action(detail=True, methods=['get'], url_path='download-pdf')
    def download_pdf(self, request, id=None):
        book = self.get_object()
        if book.is_locked:
            return Response({'detail': 'Книга заблокирована для экспорта.'}, status=403)
        content = export_book_as_pdf(book)
        response = HttpResponse(content, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{book.name}.pdf"'
        return response

    @action(detail=True, methods=['get'], url_path='download-epub')
    def download_epub(self, request, id=None):
        book = self.get_object()
        if book.is_locked:
            return Response({'detail': 'Книга заблокирована для экспорта.'}, status=403)
        content = export_book_as_epub(book)
        response = HttpResponse(content, content_type='application/epub+zip')
        response['Content-Disposition'] = f'attachment; filename="{book.name}.epub"'
        return response

    @action(detail=True, methods=['get'])
    def history(self, request, id=None):
        book = self.get_object()
        history = Page.history.filter(book_id=book.id).select_related('history_user').order_by('-history_date')
        paginator = LimitOffsetPagination()
        paginator.default_limit = 50
        page = paginator.paginate_queryset(history, request)
        serializer = BookPageHistorySerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)


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
    search_fields = ['^number', '^number_in_book']
    ordering_fields = ['number', 'modified', 'book__name']
    ordering = ['book__name', 'number']

    def list(self, request, *args, **kwargs):
        query_params = sorted((key, tuple(values)) for key, values in request.query_params.lists())
        payload = json.dumps(
            {'user_id': str(request.user.id), 'query_params': query_params, 'version': get_pages_list_cache_version()},
            sort_keys=True,
            separators=(',', ':'),
        )
        cache_key = f'pages:list:{hashlib.sha256(payload.encode("utf-8")).hexdigest()}'

        try:
            cached_response = cache.get(cache_key)
            if cached_response is not None:
                return Response(cached_response)
        except Exception:
            pass

        response = super().list(request, *args, **kwargs)
        if response.status_code == 200:
            try:
                cache.set(cache_key, response.data, timeout=settings.PAGE_LIST_CACHE_TTL)
            except Exception:
                pass
        return response

    def get_queryset(self):
        return Page.objects.select_related('book', 'book__author').order_by('book__name', 'number')

    def get_serializer_class(self, **kwargs):
        if self.action == 'list':
            return PageListSerializer
        if self.action in ('partial_update', 'update'):
            return PageUpdateSerializer
        return PageDetailSerializer

    def update(self, request, *args, **kwargs):
        page = self.get_object()
        if page.book.is_locked:
            return Response({'detail': 'Книга заблокирована для редактирования.'}, status=403)
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
        history = page.history.select_related('history_user').order_by('-history_date')
        paginator = LimitOffsetPagination()
        paginator.default_limit = 50
        result_page = paginator.paginate_queryset(history, request)
        serializer = PageHistorySerializer(result_page, many=True)
        return paginator.get_paginated_response(serializer.data)

    @action(detail=True, methods=['get'])
    def preview(self, request, id=None):
        page = self.get_object()
        return Response({'text_preview': page.text})

    @action(detail=True, methods=['post'])
    def correct(self, request, id=None):
        page = self.get_object()

        if not settings.LLM_CORRECTION_ENABLED:
            return Response({'detail': 'LLM correction is not enabled.'}, status=400)

        from books.tasks import correct_text_with_llm_task

        correct_text_with_llm_task.delay(page.id)
        return Response({'detail': 'LLM correction task started.'})


class BookmarkFilter(django_filters.FilterSet):
    book = django_filters.UUIDFilter(field_name="page__book__id")

    class Meta:
        model = Bookmark
        fields = ["book"]


class BookmarkViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    permission_classes = [IsAuthenticated]
    lookup_field = "id"
    filter_backends = [django_filters.DjangoFilterBackend, filters.OrderingFilter]
    filterset_class = BookmarkFilter
    ordering = ["-created"]

    def get_serializer_class(self):
        if self.action == "create":
            return BookmarkCreateSerializer
        return BookmarkSerializer

    def get_queryset(self):
        return Bookmark.objects.filter(user=self.request.user).select_related("page", "page__book")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
