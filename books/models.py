import uuid

from django.db import models
from django_extensions.db.models import TimeStampedModel
from django_lifecycle import LifecycleModelMixin, hook, AFTER_CREATE
from simple_history.models import HistoricalRecords

from .tasks import split_pdf_to_pages_task, extract_text_from_image_task


class Author(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

    class Meta:
        db_table = '"book"."author"'


class Book(LifecycleModelMixin, models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    author = models.ForeignKey(Author, on_delete=models.PROTECT, related_name="books")
    pdf = models.FileField(upload_to="pdfs/", null=True, blank=True)

    class Meta:
        db_table = '"book"."book"'

    def __str__(self):
        return self.name

    @hook(AFTER_CREATE, on_commit=True, when="pdf", is_not=None)
    def split_to_pages(self):
        split_pdf_to_pages_task.delay(self.id)


class Page(LifecycleModelMixin, TimeStampedModel, models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    book = models.ForeignKey(Book, on_delete=models.CASCADE)
    number = models.IntegerField()
    image_url = models.TextField(blank=True)
    image = models.FileField(upload_to="pages/", null=True, blank=True)
    text = models.TextField(blank=True)
    processed = models.BooleanField(default=False)
    text_size = models.IntegerField(null=True, blank=True, default=12)

    history = HistoricalRecords()

    def __str__(self) -> str:
        return f"{self.book.name} ({self.number})"

    class Meta:
        db_table = '"book"."page"'

    @hook(AFTER_CREATE, on_commit=True, when="image", is_not=None)
    def extract_text_from_image(self):
        extract_text_from_image_task.delay(self.id)

# class PageText(models.Model):
#     id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
#     book = models.ForeignKey(Book, on_delete=models.CASCADE)
#     page = models.ForeignKey(Page, on_delete=models.PROTECT)
#     editor = models.ForeignKey(get_user_model(), on_delete=models.PROTECT)
#     text = models.TextField()
#     date = models.DateTimeField(auto_now_add=True)
#
#     history = HistoricalRecords()
#
#     def __str__(self):
#         return f"Text for page {self.page.number} of {self.book.name}"
#
#     class Meta:
#         db_table = '"book"."page_text"'

# for future


# class ImageFragment(models.Model):
#    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
#    page = models.ForeignKey(Page, on_delete=models.CASCADE)


# class FragmentText(models.Model):
#    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
#    book = models.ForeignKey(Book, on_delete=models.CASCADE)
#    page = models.ForeignKey(Page, on_delete=models.SET_NULL)
#    fragment = models.ForeignKey(ImageFragment, null=True, on_delete=models.SET_NULL)
#    editor = models.ForeignKey(get_user_model(), on_delete=models.PROTECT)
#    text = models.TextField()
#    # date


# class TextOrder(models.Model):
#    prev = models.ForeignKey(FragmentText, on_delete=models.CASCADE, related_name="+")
#    next = models.ForeignKey(FragmentText, on_delete=models.CASCADE, related_name="+")
