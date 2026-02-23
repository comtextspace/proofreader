from rest_framework import serializers

from accounts.models import PageStatus
from books.models import Author, Book, Bookmark, Page


class AuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Author
        fields = ['id', 'name']


class AuthorListSerializer(serializers.ModelSerializer):
    books_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Author
        fields = ['id', 'name', 'books_count']


class AuthorCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Author
        fields = ['id', 'name']
        read_only_fields = ['id']


class BookShortSerializer(serializers.ModelSerializer):
    author = serializers.CharField(source='author.name', read_only=True)

    class Meta:
        model = Book
        fields = ['id', 'name', 'author', 'is_locked']


class BookListSerializer(serializers.ModelSerializer):
    author = serializers.CharField(source='author.name', read_only=True)
    author_id = serializers.UUIDField(source='author.id', read_only=True)
    pages_count = serializers.IntegerField(read_only=True)
    pages_done_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Book
        fields = ['id', 'name', 'author', 'author_id', 'pages_count', 'pages_done_count', 'total_pages_in_pdf']


class BookDetailSerializer(serializers.ModelSerializer):
    author = AuthorSerializer(read_only=True)
    pages_count = serializers.IntegerField(read_only=True)
    pages_done_count = serializers.IntegerField(read_only=True)
    pages_processing_count = serializers.IntegerField(read_only=True)
    pages_recognized_count = serializers.IntegerField(read_only=True)
    pages_in_work_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Book
        fields = [
            'id',
            'name',
            'author',
            'pages_count',
            'pages_done_count',
            'pages_processing_count',
            'pages_recognized_count',
            'pages_in_work_count',
            'total_pages_in_pdf',
            'export_name',
            'is_locked',
        ]


class BookCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = ['id', 'name', 'author', 'pdf']
        read_only_fields = ['id']


class PageListSerializer(serializers.ModelSerializer):
    book_name = serializers.CharField(source='book.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Page
        fields = ['id', 'number', 'number_in_book', 'book', 'book_name', 'status', 'status_display', 'modified']


class PageDetailSerializer(serializers.ModelSerializer):
    book = BookShortSerializer(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    available_statuses = serializers.SerializerMethodField()
    total_pages = serializers.SerializerMethodField()
    is_bookmarked = serializers.SerializerMethodField()
    bookmark_id = serializers.SerializerMethodField()
    bookmark_name = serializers.SerializerMethodField()

    class Meta:
        model = Page
        fields = [
            'id',
            'book',
            'number',
            'number_in_book',
            'image',
            'text',
            'status',
            'status_display',
            'available_statuses',
            'total_pages',
            'modified',
            'created',
            'is_bookmarked',
            'bookmark_id',
            'bookmark_name',
        ]

    def get_available_statuses(self, obj):
        request = self.context.get('request')
        if not request or not hasattr(request, 'user'):
            return [{'value': s[0], 'label': s[1]} for s in Page.Status.choices]

        statuses = (
            PageStatus.objects.filter(permission_groups__in=request.user.groups.all())
            .distinct()
            .values_list('status', flat=True)
        )

        if statuses:
            return [{'value': s[0], 'label': s[1]} for s in Page.Status.choices if s[0] in statuses]

        return [{'value': s[0], 'label': s[1]} for s in Page.Status.choices]

    def get_total_pages(self, obj):
        return obj.book.pages.count()

    def _get_bookmark(self, obj):
        request = self.context.get('request')
        if not request or not hasattr(request, 'user') or not request.user.is_authenticated:
            return None
        return obj.bookmarks.filter(user=request.user).first()

    def get_is_bookmarked(self, obj):
        return self._get_bookmark(obj) is not None

    def get_bookmark_id(self, obj):
        bookmark = self._get_bookmark(obj)
        return str(bookmark.id) if bookmark else None

    def get_bookmark_name(self, obj):
        bookmark = self._get_bookmark(obj)
        return bookmark.name if bookmark else None


class PageUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Page
        fields = ['text', 'status', 'number_in_book']

    def validate_status(self, value):
        request = self.context.get('request')
        if not request or not hasattr(request, 'user'):
            return value

        statuses = (
            PageStatus.objects.filter(permission_groups__in=request.user.groups.all())
            .distinct()
            .values_list('status', flat=True)
        )

        if statuses and value not in statuses:
            raise serializers.ValidationError("You don't have permission to set this status.")

        return value


class BookmarkSerializer(serializers.ModelSerializer):
    page_number = serializers.IntegerField(source="page.number", read_only=True)
    book_id = serializers.UUIDField(source="page.book.id", read_only=True)
    book_name = serializers.CharField(source="page.book.name", read_only=True)

    class Meta:
        model = Bookmark
        fields = ["id", "page", "page_number", "book_id", "book_name", "name", "created"]
        read_only_fields = ["id", "created"]


class BookmarkCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bookmark
        fields = ["id", "page", "name"]
        read_only_fields = ["id"]


class BookmarkUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bookmark
        fields = ["id", "name"]
        read_only_fields = ["id"]


class PageAdjacentSerializer(serializers.Serializer):
    prev_id = serializers.UUIDField(allow_null=True)
    next_id = serializers.UUIDField(allow_null=True)


class PageHistorySerializer(serializers.Serializer):
    history_id = serializers.IntegerField()
    history_date = serializers.DateTimeField()
    history_user = serializers.CharField(source='history_user.username', default=None)
    history_type = serializers.CharField()
    text = serializers.CharField()
    status = serializers.CharField()


class BookPageHistorySerializer(PageHistorySerializer):
    page_number = serializers.IntegerField(source='number')
    page_id = serializers.UUIDField(source='id')


class UserHistorySerializer(BookPageHistorySerializer):
    book_name = serializers.CharField()
    book_id = serializers.UUIDField()
