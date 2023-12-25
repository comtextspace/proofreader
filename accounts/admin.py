from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.urls import reverse
from django.utils.safestring import mark_safe
from django.utils.translation import gettext_lazy as _

from .forms import CustomUserChangeForm, CustomUserCreationForm
from .models import Assignment, CustomUser, PageStatus, UserSettings


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    add_form = CustomUserCreationForm
    form = CustomUserChangeForm
    model = CustomUser


class UserAssignmentInline(admin.TabularInline):
    model = Assignment
    extra = 0
    autocomplete_fields = ['book']


@admin.register(UserSettings)
class UserSettingsAdmin(admin.ModelAdmin):
    list_display = ('username', 'text_size', 'assigned_pages')
    list_editable = ('text_size',)
    fields = ('text_size',)
    inlines = [UserAssignmentInline]

    def get_queryset(self, request):
        if request.user.is_superuser:
            return super().get_queryset(request)
        else:
            return super().get_queryset(request).filter(id=request.user.id)

    @admin.display(description=_('Назначенные страницы'))
    def assigned_pages(self, obj):
        link = f"{reverse('admin:books_page_changelist')}?assignment={obj.id}"
        return mark_safe(f'<a href="{link}">{_("перейти")}</a>')


@admin.register(PageStatus)
class PageStatusAdmin(admin.ModelAdmin):
    list_display = ('status', 'permissions')
    fields = ('status', 'permission_groups')
    filter_horizontal = ('permission_groups',)
    search_fields = ('status',)
    readonly_fields = ('status',)

    def permissions(self, obj):
        return mark_safe('<br>'.join([group.name for group in obj.permission_groups.all()]))

    def has_add_permission(self, request):
        return False
