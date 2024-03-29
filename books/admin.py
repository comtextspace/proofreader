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
from .models import Author, Book, Page
from .services.book_export import export_book
from .tasks import extract_text_from_image_task, split_pdf_to_pages_task

User = get_user_model()


@admin.register(Author)
class AuthorAdmin(admin.ModelAdmin):
    list_display = ["name"]
    search_fields = ['name']


def download_as_text_file(modeladmin, request, queryset):
    book = queryset.first()  # Assuming you want to download pages for one book at a time
    text = export_book(book)
    response = HttpResponse(text, content_type='text/plain')
    response['Content-Disposition'] = f'attachment; filename="{book.name}.md"'
    return response


download_as_text_file.short_description = _("Скачать книгу текстовым файлом")


def process_unprocessed_pages(modeladmin, request, queryset):
    for page in Page.objects.filter(status=Page.Status.PROCESSING, book__in=queryset):
        extract_text_from_image_task.delay(page.id)
    messages.add_message(request, messages.INFO, _('Задачи по распознаванию текста запущены'))


process_unprocessed_pages.short_description = _("Повторно запустить задачи по распознаванию текста")


def continue_pages_splittings(modeladmin, request, queryset):
    for book in queryset:
        last_page = book.pages.order_by('-number').first().values_list('number', flat=True)
        split_pdf_to_pages_task.delay(book.id, start_page=last_page + 1)
    messages.add_message(request, messages.INFO, _('Задачи по разделению страниц запущены'))


continue_pages_splittings.short_description = _("Повторно запустить задачи по разделению страниц")


class AssignmentAdminInline(admin.TabularInline):
    model = Assignment
    extra = 0
    autocomplete_fields = ['user']


@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    actions = [download_as_text_file, process_unprocessed_pages, continue_pages_splittings]
    list_display = [
        "name",
        "author",
        'status',
        'total_pages_in_pdf',
        'pages_count',
        'pages_processing_count',
        'pages_ready_count',
        'pages_in_progress_count',
        'pages_done_count',
    ]
    list_filter = ['author']
    search_fields = ['name', 'author__name']
    readonly_fields = [
        'status',
        'pages_count',
        'pages_processing_count',
        'pages_ready_count',
        'pages_in_progress_count',
        'pages_done_count',
    ]
    fieldsets = ((None, {'fields': ('name', 'author', 'pdf')}),)
    autocomplete_fields = ['author']
    inlines = [AssignmentAdminInline]

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


def numerate_pages(modeladmin, request, queryset):
    page = queryset.first()

    try:
        start_number = int(request.POST.get('action_value')) - 1
    except ValueError:
        messages.add_message(request, messages.ERROR, _('Введите целое число'))
        return

    # numerate pages start from given
    for page in Page.objects.filter(book=page.book, number__gte=page.number).order_by('number'):
        page.number_in_book = start_number + 1
        start_number += 1
        page.save(update_fields=['number_in_book'])

    messages.add_message(request, messages.INFO, _('Задача по нумерации страниц запущена'))


numerate_pages.short_description = _("Запустить задачу по нумерации страниц")


@admin.register(Page)
class PageAdmin(CustomHistoryAdmin):
    form = PageAdminForm
    actions = [numerate_pages]
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

        return super().changeform_view(request, object_id, form_url, extra_context)  # noqa

    @admin.display(description=_('Размер текста'))
    def text_size(self, obj):
        return self.request.user.text_size

    @add_request_object_to_admin_form
    def get_form(self, request, obj=None, change=False, **kwargs):
        return super().get_form(request, obj, change, **kwargs)
