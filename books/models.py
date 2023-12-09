import uuid

from django.db import models
from django.utils.translation import gettext_lazy as _
from django_extensions.db.models import TimeStampedModel
from django_lifecycle import AFTER_CREATE, LifecycleModelMixin, hook
from simple_history.models import HistoricalRecords

from .tasks import extract_text_from_image_task, split_pdf_to_pages_task


class Author(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

    class Meta:
        db_table = '"book"."author"'
        verbose_name = _("Автор")
        verbose_name_plural = _("Авторы")


class Book(LifecycleModelMixin, models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, verbose_name=_("Название"))
    author = models.ForeignKey(Author, on_delete=models.PROTECT, related_name="books", verbose_name=_("Автор"))
    pdf = models.FileField(upload_to="pdfs/", null=True, blank=True)
    total_pages_in_pdf = models.IntegerField(null=True, blank=True)

    class Meta:
        db_table = '"book"."book"'
        verbose_name = _("Книга")
        verbose_name_plural = _("Книги")

    def __str__(self):
        return self.name

    @hook(AFTER_CREATE, on_commit=True, when="pdf", is_not=None)
    def split_to_pages(self):
        split_pdf_to_pages_task.delay(self.id)


class Page(LifecycleModelMixin, TimeStampedModel, models.Model):
    class Status(models.TextChoices):
        PROCESSING = "processing", _("Распознавание")
        READY = "redy", _("Распознано")
        IN_PROGRESS = "in_progress", _("Вычитка")
        FORMATTING = "formatting", _("Форматирование")
        CHECK = "check", _("Проверка")
        DONE = "done", _("Завершено")

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name="pages", verbose_name=_("Книга"))
    number = models.IntegerField(verbose_name=_("Порядковый номер страницы"))
    image_url = models.TextField(blank=True)
    image = models.FileField(upload_to="pages/", null=True, blank=True)
    text = models.TextField(blank=True)
    status = models.CharField(
        max_length=100, choices=Status.choices, default=Status.PROCESSING, verbose_name=_("Статус")
    )
    number_in_book = models.CharField(null=True, blank=True, verbose_name=_("Номер страницы в книге"), max_length=100)

    history = HistoricalRecords()

    def __str__(self) -> str:
        return f"{self.book.name} ({self.number})"

    class Meta:
        db_table = '"book"."page"'
        verbose_name = _("Страница")
        verbose_name_plural = _("Страницы")

    @hook(AFTER_CREATE, on_commit=True, when="image", is_not=None)
    def extract_text_from_image(self):
        extract_text_from_image_task.delay(self.id)
