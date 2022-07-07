from django.contrib import admin

from .models import Author, Book, Page, PageText


admin.site.register(Author)
admin.site.register(Book)
admin.site.register(Page)
admin.site.register(PageText)
