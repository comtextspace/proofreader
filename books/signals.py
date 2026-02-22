from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

from books.cache import bump_pages_list_cache_version
from books.models import Page


@receiver(post_save, sender=Page)
def bump_pages_list_cache_version_on_save(sender, **kwargs):
    bump_pages_list_cache_version()


@receiver(post_delete, sender=Page)
def bump_pages_list_cache_version_on_delete(sender, **kwargs):
    bump_pages_list_cache_version()
