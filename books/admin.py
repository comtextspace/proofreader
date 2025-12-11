from admin_auto_filters.filters import AutocompleteFilter
from django.contrib import admin, messages
from django.contrib.auth import get_user_model
from django.db import models
from django.http import HttpResponse
from django.shortcuts import redirect
from django.urls import reverse
from django.utils.safestring import mark_safe
from django.utils.translation import gettext_lazy as _

from accounts.models import Assignment
from core.admin_filter import ForeignKeyFilter
from core.admin_utils import CustomHistoryAdmin, add_request_object_to_admin_form
from .admin_forms import ActionValueForm, PageAdminForm
from .models import Author, Book, ExportSource, Page
from .services.book_export import export_book
from .services.github_upload import upload_books_to_github
from .tasks import extract_text_from_image_task, split_pdf_to_pages_task

User = get_user_model()


@admin.register(ExportSource)
class ExportSourceAdmin(admin.ModelAdmin):
    list_display = ["name", "repo", "branch", "directory"]
    search_fields = ['name', 'repo']


@admin.register(Author)
class AuthorAdmin(admin.ModelAdmin):
    list_display = ["name"]
    search_fields = ['name']


@admin.action(description=_("Скачать книгу текстовым файлом"))
def download_as_text_file(modeladmin, request, queryset):
    book = queryset.first()  # Assuming you want to download pages for one book at a time
    text = export_book(book)
    response = HttpResponse(text, content_type='text/plain')
    response['Content-Disposition'] = f'attachment; filename="{book.name}.md"'
    return response


@admin.action(description=_("Загрузить в GitHub репозиторий"))
def upload_to_github(modeladmin, request, queryset):
    from django.conf import settings

    # Check if GitHub token is configured
    if not getattr(settings, 'GITHUB_TOKEN', None):
        messages.error(request, _('GitHub токен не сконфигурирован. Добавьте GITHUB_TOKEN в settings.'))
        return

    results = upload_books_to_github(queryset)

    # Process results and show messages
    successful = [r for r in results if r['success']]
    skipped = [r for r in results if r.get('skipped')]
    failed = [r for r in results if not r['success'] and not r.get('skipped')]

    if successful:
        success_msg = _('Успешно загружено в GitHub: ') + ', '.join([r['book'] for r in successful])
        messages.success(request, success_msg)

        # Show URLs for uploaded files
        for result in successful:
            if 'url' in result:
                messages.info(request, mark_safe(f"<a href='{result['url']}' target='_blank'>{result['book']}</a>"))

    if skipped:
        skipped_books = ', '.join([r['book'] for r in skipped])
        messages.warning(request, _('Пропущено (не указан источник экспорта): ') + skipped_books)

    if failed:
        for result in failed:
            messages.error(request, f"{result['book']}: {result['message']}")


@admin.action(description=_("Повторно запустить задачи по распознаванию текста"))
def process_unprocessed_pages(modeladmin, request, queryset):
    for page in Page.objects.filter(status=Page.Status.PROCESSING, book__in=queryset):
        extract_text_from_image_task.delay(page.id)
    messages.add_message(request, messages.INFO, _('Задачи по распознаванию текста запущены'))


@admin.action(description=_("Повторно запустить задачи по разделению страниц"))
def continue_pages_splittings(modeladmin, request, queryset):
    for book in queryset:
        last_page = book.pages.order_by('-number').first().values_list('number', flat=True)
        split_pdf_to_pages_task.delay(book.id, start_page=last_page + 1)
    messages.add_message(request, messages.INFO, _('Задачи по разделению страниц запущены'))


class AssignmentAdminInline(admin.TabularInline):
    model = Assignment
    extra = 0
    autocomplete_fields = ['user']


@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    actions = [download_as_text_file, upload_to_github, process_unprocessed_pages, continue_pages_splittings]
    list_display = [
        "name",
        "author",
        "export_source",
        "export_name",
        'status',
        'total_pages_in_pdf',
        'pages_count',
        'pages_processing_count',
        'pages_ready_count',
        'pages_in_progress_count',
        'pages_done_count',
        'view_pages_link',
    ]
    list_editable = ["export_source", "export_name"]
    list_filter = ['author']
    search_fields = ['name', 'author__name']
    readonly_fields = [
        'status',
        'pages_count',
        'pages_processing_count',
        'pages_ready_count',
        'pages_in_progress_count',
        'pages_done_count',
        'view_pages_link',
    ]
    fieldsets = (
        (None, {'fields': ('name', 'author', 'pdf', 'export_source', 'export_name')}),
        (
            _('Страницы'),
            {
                'fields': (
                    'view_pages_link',
                    'status',
                    'pages_count',
                    'pages_processing_count',
                    'pages_ready_count',
                    'pages_in_progress_count',
                    'pages_done_count',
                )
            },
        ),
    )
    autocomplete_fields = ['author', 'export_source']
    inlines = [AssignmentAdminInline]

    def changelist_view(self, request, extra_context=None):
        extra_context = extra_context or {}
        extra_context['title'] = _('Выберите Книгу для изменения')
        return super().changelist_view(request, extra_context)

    def get_queryset(self, request):
        # annotate pages count for each page status
        return (
            super()
            .get_queryset(request)
            .annotate(
                pages_count=models.Count('pages'),
                pages_processing_count=models.Count('pages', filter=models.Q(pages__status=Page.Status.PROCESSING)),
                pages_ready_count=models.Count('pages', filter=models.Q(pages__status=Page.Status.READY)),
                pages_in_progress_count=models.Count('pages', filter=models.Q(pages__status=Page.Status.IN_PROGRESS)),
                pages_done_count=models.Count('pages', filter=models.Q(pages__status=Page.Status.DONE)),
            )
        )

    def status(self, obj):
        if obj.pages_processing_count > 0:
            return _('Распознавание')
        elif obj.pages_done_count == obj.total_pages_in_pdf:
            return _('Завершено')
        else:
            return _('Вычитка')

    def pages_count(self, obj):
        return obj.pages_count

    def pages_processing_count(self, obj):
        return obj.pages_processing_count

    def pages_ready_count(self, obj):
        return obj.pages_ready_count

    def pages_in_progress_count(self, obj):
        return obj.pages_in_progress_count

    def pages_done_count(self, obj):
        return obj.pages_done_count

    @admin.display(description=_('Страницы'))
    def view_pages_link(self, obj):
        if obj.pk:
            url = reverse('admin:books_page_changelist') + f'?book={obj.pk}'
            return mark_safe(f'<a href="{url}">{_("Просмотреть страницы")}</a>')
        return '-'


class BookFilter(AutocompleteFilter):
    title = _('Книга')  # display title
    field_name = 'book'  # name of the foreign key field


class AssigmentPagesFilter(admin.SimpleListFilter):
    title = _('Назначенные страницы')  # display title
    parameter_name = 'assigned_pages'  # lookup parameter for filtering

    def lookups(self, request, model_admin):
        return (('assigned', _('Назначенные')),)

    def queryset(self, request, queryset):
        if self.value() == 'assigned':
            return queryset.user_assignments(request.user)
        elif self.value() is None:
            return queryset


class AssignmentFilter(ForeignKeyFilter):
    title = _('ID пользователя (по назначению)')  # display title
    lookup = 'assignment'

    def queryset(self, request, queryset):
        f_key: str = self.value()
        if f_key and f_key.isnumeric():
            user = User.objects.get(id=f_key)
            return queryset.user_assignments(user)


@admin.action(description=_("Назначить выбранные страницы себе"))
def assign_pages_to_self(modeladmin, request, queryset):
    """
    Creates or updates assignments for selected pages to current user.
    Groups pages by book and creates compact page range strings.
    Note: This action doesn't require action_value field.
    """
    user = request.user

    # Group pages by book
    pages_by_book = {}
    for page in queryset.select_related('book').order_by('book', 'number'):
        if page.book.id not in pages_by_book:
            pages_by_book[page.book.id] = {'book': page.book, 'pages': []}
        pages_by_book[page.book.id]['pages'].append(page.number)

    # Helper function to convert list of page numbers to compact string format
    def pages_to_string(page_numbers):
        """Convert list of integers to compact string like '1-5,10,15-20'"""
        if not page_numbers:
            return ''

        page_numbers = sorted(set(page_numbers))
        ranges = []
        start = page_numbers[0]
        end = page_numbers[0]

        for num in page_numbers[1:]:
            if num == end + 1:
                end = num
            else:
                ranges.append(f'{start}-{end}' if start != end else str(start))
                start = end = num
        ranges.append(f'{start}-{end}' if start != end else str(start))

        return ','.join(ranges)

    created_count = 0
    updated_count = 0

    # Create or update assignments for each book
    for book_data in pages_by_book.values():
        book = book_data['book']
        new_pages = book_data['pages']
        new_pages_str = pages_to_string(new_pages)

        # Check if assignment already exists
        existing_assignment = Assignment.objects.filter(user=user, book=book).first()

        if existing_assignment:
            # Merge with existing pages
            from books.managers import PagesQuerySet

            existing_pages = PagesQuerySet._get_list_of_int_from_comma_separated_string(existing_assignment.pages)
            merged_pages = sorted(set(existing_pages + new_pages))
            existing_assignment.pages = pages_to_string(merged_pages)
            existing_assignment.save()
            updated_count += 1
        else:
            # Create new assignment
            Assignment.objects.create(user=user, book=book, pages=new_pages_str)
            created_count += 1

    # Show success message
    if created_count > 0:
        messages.success(request, _('Создано назначений: %(count)d') % {'count': created_count})
    if updated_count > 0:
        messages.success(request, _('Обновлено назначений: %(count)d') % {'count': updated_count})

    total_pages = sum(len(data['pages']) for data in pages_by_book.values())
    messages.info(request, _('Назначено страниц: %(count)d') % {'count': total_pages})


@admin.action(description=_("Запустить задачу по нумерации страниц"))
def numerate_pages(modeladmin, request, queryset):
    page = queryset.first()

    action_value = request.POST.get('action_value')

    if not action_value:
        messages.add_message(request, messages.ERROR, _('Введите начальный номер страницы'))
        return

    try:
        start_number = int(action_value) - 1
    except ValueError:
        messages.add_message(request, messages.ERROR, _('Введите целое число'))
        return

    # numerate pages start from given
    for page in Page.objects.filter(book=page.book, number__gte=page.number).order_by('number'):
        page.number_in_book = start_number + 1
        start_number += 1
        page.save(update_fields=['number_in_book'])

    messages.add_message(request, messages.INFO, _('Задача по нумерации страниц запущена'))


@admin.register(Page)
class PageAdmin(CustomHistoryAdmin):
    form = PageAdminForm
    actions = [assign_pages_to_self, numerate_pages]
    action_form = ActionValueForm
    change_form_template = "admin/page_change_form.html"
    list_display = ["number", "book", "modified", 'status']
    history_list_display = ["text", "status"]
    readonly_fields = ['book', 'page', 'number', 'text_size']
    fieldsets = (
        (_('Редактирование'), {'fields': (('text', 'page'),)}),
        (None, {'fields': (('book', 'number', 'status', 'text_size', 'number_in_book'),)}),
    )
    list_filter = [AssigmentPagesFilter, BookFilter, 'status', AssignmentFilter]
    search_fields = ['number']

    def changelist_view(self, request, extra_context=None):
        extra_context = extra_context or {}
        extra_context['title'] = _('Выберите Страницу для изменения')
        return super().changelist_view(request, extra_context)

    def get_queryset(self, request):
        return super().get_queryset(request).order_by('book__name', 'number')

    def page(self, obj):
        if obj.image:
            image_url = obj.image.url
            return mark_safe(
                f"""
<div>
    <img src="{image_url}" alt="Description" id="image" width="750" height="970">
</div>
"""
            )
        return '-'

    def _get_context(self, request, object_id=None) -> dict:
        obj = self.get_object(request, object_id)
        extra_context = {
            'prev_page_exists': Page.objects.filter(book=obj.book, number=obj.number - 1).exists(),
            'next_page_exists': Page.objects.filter(book=obj.book, number=obj.number + 1).exists(),
        }

        return extra_context

    def change_view(self, request, object_id, form_url='', extra_context=None):
        self.request = request
        extra_context = extra_context or {}
        extra_context.update(self._get_context(request, object_id))
        return self.changeform_view(request, object_id, form_url, extra_context)

    def response_change(self, request, obj):
        # Redirect to Steps:
        if '_save' in request.POST:
            next_page = Page.objects.filter(book=obj.book, number=obj.number + 1).last()
            return redirect(reverse("admin:books_page_change", args=(next_page.id,)))
        return super().response_change(request, obj)  # noqa

    def changeform_view(self, request, object_id=None, form_url='', extra_context=None):
        current_page = self.get_object(request, object_id)
        if 'back_page' in request.POST:
            prev_page = Page.objects.filter(book=current_page.book, number=current_page.number - 1).last()
            return redirect(reverse("admin:books_page_change", args=(prev_page.id,)))

        elif 'next_page' in request.POST:
            next_page = Page.objects.filter(book=current_page.book, number=current_page.number + 1).last()
            return redirect(reverse("admin:books_page_change", args=(next_page.id,)))

        # Add custom title with page information
        extra_context = extra_context or {}
        if object_id and current_page:
            page_info = f'{current_page.number}'
            if current_page.number_in_book:
                page_info = f'{current_page.number} ({current_page.number_in_book})'
            extra_context['title'] = f'Изменить Страницу: {current_page.book.name} - Страница {page_info}'

        return super().changeform_view(request, object_id, form_url, extra_context)  # noqa

    @admin.display(description=_('Размер текста'))
    def text_size(self, obj):
        return self.request.user.text_size

    @add_request_object_to_admin_form
    def get_form(self, request, obj=None, change=False, **kwargs):
        return super().get_form(request, obj, change, **kwargs)
