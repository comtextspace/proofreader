from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.safestring import mark_safe

from .forms import CustomUserChangeForm, CustomUserCreationForm
from .models import CustomUser, PageStatus, UserSettings


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    add_form = CustomUserCreationForm
    form = CustomUserChangeForm
    model = CustomUser


@admin.register(UserSettings)
class UserSettingsAdmin(admin.ModelAdmin):
    list_display = ('username', 'text_size')
    list_editable = ('text_size',)
    fields = ('text_size',)

    def get_queryset(self, request):
        return super().get_queryset(request).filter(id=request.user.id)


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
