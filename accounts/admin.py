from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .forms import CustomUserCreationForm, CustomUserChangeForm
from .models import CustomUser, UserSettings


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
