from django.contrib.auth.models import AbstractUser, Group, UserManager
from django.db import models
from django.utils.translation import gettext_lazy as _


class CustomUserManager(UserManager):
    def create_user(self, username, email=None, password=None, **extra_fields):
        print('create_user')
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", False)
        user = self._create_user(username, email, password, **extra_fields)

        # Add user to editor group:
        editor_permission_group = Group.objects.get_or_create(name=_("Редактор"))[0]
        user.groups.add(editor_permission_group)

        return user


class CustomUser(AbstractUser):
    text_size = models.IntegerField(null=True, blank=True, default=12, verbose_name=_('Размер текста'))
    objects = CustomUserManager()


class UserSettings(CustomUser):
    class Meta:
        proxy = True
        verbose_name = _('Настройки аккаунта')
        verbose_name_plural = _('Настройки аккаунта')
