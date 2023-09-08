from django import forms
from django.contrib import admin
from django.shortcuts import redirect
from django.urls import reverse
from django.utils.safestring import mark_safe
from simple_history.admin import SimpleHistoryAdmin

from .models import Author, Book, Page

admin.site.register(Author)
admin.site.register(Book)


class PageAdminForm(forms.ModelForm):
    text = forms.CharField(
        widget=forms.Textarea(attrs={'class': 'resizeable-textarea', 'rows': 60, 'cols': 80}),
        label='Your Text'
    )

    text_size = forms.IntegerField(
        label='Text Size (px)',
        widget=forms.NumberInput(attrs={'id': 'text-size-input'}),
    )

    class Meta:
        model = Page
        fields = '__all__'


@admin.register(Page)
class PageAdmin(SimpleHistoryAdmin):
    form = PageAdminForm
    change_form_template = "admin/page_change_form.html"
    list_display = ["number", "book", "modified", "processed"]
    history_list_display = ["text"]
    readonly_fields = ['book', 'page', 'number']
    fieldsets = (
        (None, {
            'fields': ('book', 'number', 'text_size')
        }),
        ('Редактирование', {
            'fields': (('text', 'page'),)
        }),
    )
    list_filter = ('book',)

    def page(self, obj):
        if obj.image:
            image_url = obj.image.url
            return mark_safe(
                f'<a href="{image_url}" data-fancybox="images" data-caption="page">'
                f'<img src="{image_url}" width="600" /></a>'
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
        extra_context = extra_context or {}
        extra_context.update(self._get_context(request, object_id))
        return self.changeform_view(request, object_id, form_url, extra_context)

    def changeform_view(self, request, object_id=None, form_url='', extra_context=None):
        current_page = self.get_object(request, object_id)
        if f'back_page' in request.POST:
            prev_page = Page.objects.filter(book=current_page.book, number=current_page.number - 1).last()
            return redirect(reverse("admin:books_page_change", args=(prev_page.id,)))

        elif f'next_page' in request.POST:
            next_page = Page.objects.filter(book=current_page.book, number=current_page.number + 1).last()
            return redirect(reverse("admin:books_page_change", args=(next_page.id,)))

        return super().changeform_view(request, object_id, form_url, extra_context)  # noqa
