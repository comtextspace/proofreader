from django.contrib import admin
from django.db import models
from django.forms import Textarea
from django.utils.safestring import mark_safe
from simple_history.admin import SimpleHistoryAdmin

from .models import Author, Book, Page

admin.site.register(Author)
admin.site.register(Book)


@admin.register(Page)
class PageAdmin(SimpleHistoryAdmin):
    list_display = ["number", "book", "modified"]
    history_list_display = ["text"]
    readonly_fields = ['book', 'logo_preview', 'number']
    fieldsets = (
        (None, {
            'fields': ('book', 'number')
        }),
        ('Редактирование', {
            'fields': (('logo_preview', 'text'),)
        }),
    )
    formfield_overrides = {
        models.TextField: {'widget': Textarea(attrs={'rows': 60, 'cols': 80})},
    }
    list_filter = ('book',)

    def logo_preview(self, obj):
        if obj.image:
            return mark_safe(
                f'<a href="{obj.image.url}"><img src="{obj.image.url}" width="500" /></a>')  # nosec

        return '-'
