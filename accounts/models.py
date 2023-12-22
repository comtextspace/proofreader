from django.contrib.auth.models import AbstractUser, Group, UserManager
from django.core.validators import RegexValidator
from django.db import models
from django.utils.translation import gettext_lazy as _
from django_lifecycle import LifecycleModelMixin
from model_utils.models import TimeStampedModel
from simple_history.models import HistoricalRecords

from books.models import Page


class CustomUserManager(UserManager):
    def create_user(self, username, email=None, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", False)
        user = self._create_user(username, email, password, **extra_fields)

        # Add user to editor group:
        editor_permission_group = Group.objects.get_or_create(name="Корректор")[0]
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


class PageStatus(LifecycleModelMixin, TimeStampedModel, models.Model):
    status = models.CharField(
        max_length=100, choices=Page.Status.choices, default=Page.Status.PROCESSING, verbose_name=_("Статус")
    )
    permission_groups = models.ManyToManyField(
        "auth.Group", related_name="page_statuses", verbose_name=_("Группы доступа")
    )

    history = HistoricalRecords()

    class Meta:
        db_table = '"book"."page_status"'
        verbose_name = _("Статус страницы")
        verbose_name_plural = _("Статусы страниц")


class Assignment(LifecycleModelMixin, models.Model):
    book = models.ForeignKey(
        'books.Book', on_delete=models.CASCADE, related_name="assignments", verbose_name=_("Книга")
    )
    user = models.ForeignKey(
        CustomUser, on_delete=models.CASCADE, related_name="assignments", verbose_name=_("Пользователь")
    )
    pages = models.CharField(
        max_length=100,
        verbose_name=_("Страницы"),
        validators=[RegexValidator(r'^[0-9,-]+$')],
        help_text=_("Номера страниц через запятую или диапазон через тире"),
    )

    def __str__(self):
        return f"{self.book.name} - {self.user.username}"
