from statistics import mode
from django.db import models
import uuid


class Author(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)


class Book(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    author = models.ForeignKey(Author, on_delete=models.PROTECT, related_name='books')


class Page(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    book = models.ForeignKey(Book, on_delete=models.CASCADE)
    number = models.IntegerField()

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['book', 'number'], name="unique_book_number")
        ]


class Scan(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    page = models.ForeignKey(Page, on_delete=models.CASCADE)


class ScanFragment(models.Model):
    pass


class Text(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    book = models.ForeignKey(Book, on_delete=models.CASCADE)
    page = models.ForeignKey(Page, null=True, on_delete=models.SET_NULL)
    fragment = models.ForeignKey(ScanFragment, null=True, on_delete=models.SET_NULL)
    text = models.TextField()


class TextOrder(models.Model):
    prev = models.ForeignKey(Text, on_delete=models.CASCADE, related_name='+')
    next = models.ForeignKey(Text, on_delete=models.CASCADE, related_name='+')
