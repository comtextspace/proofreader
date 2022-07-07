from django.contrib.auth import get_user_model

from statistics import mode
from django.db import models
import uuid


class Author(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class Book(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    author = models.ForeignKey(Author, on_delete=models.PROTECT, related_name="books")

    def __str__(self):
        return self.name


class Page(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    book = models.ForeignKey(Book, on_delete=models.CASCADE)
    number = models.IntegerField()
    image_url = models.TextField()

    def __str__(self) -> str:
        return f"{self.book.name} ({self.number})"

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["book", "number"], name="unique_book_number"
            )
        ]


class PageText(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    book = models.ForeignKey(Book, on_delete=models.CASCADE)
    page = models.ForeignKey(Page, on_delete=models.PROTECT)
    editor = models.ForeignKey(get_user_model(), on_delete=models.PROTECT)
    text = models.TextField()
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Text for page {self.page.number} of {self.book.name}"


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
