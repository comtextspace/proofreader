from django.contrib.auth.models import AbstractUser
from django.db import models


class CustomUser(AbstractUser):
    text_size = models.IntegerField(null=True, blank=True, default=12, verbose_name='Размер текста')


class UserSettings(CustomUser):
    class Meta:
        proxy = True
        verbose_name = 'Настройки аккаунта'
        verbose_name_plural = 'Настройки аккаунта'
