from django.conf import settings
from django.core.files.base import ContentFile
from PyPDF2 import PdfReader

from books.services.image_actions import extract_text_from_image
from books.services.pdf_actions import split_pdf_to_pages
from taskapp.celery import app


@app.task(
    acks_late=True,
    retry_backoff=True,
    retry_backoff_max=60,
    retry_jitter=True,
    retry_kwargs={'max_retries': 3},
    trail=False,
)
def split_pdf_to_pages_task(book_id):
    from books.models import Book, Page

    book = Book.objects.get(id=book_id)
    PdfReader(book.pdf)

    for page_number, page_image, image_name in split_pdf_to_pages(book.pdf, book.name):
        page = Page(book=book, number=page_number)
        page.image.save(image_name, ContentFile(page_image), save=True)

        # Limits for local development
        if settings.LOCAL_DEVELOP and page_number == 10:
            break


@app.task(
    acks_late=True,
    retry_backoff=True,
    retry_backoff_max=60,
    retry_jitter=True,
    retry_kwargs={'max_retries': 3},
    trail=False,
)
def extract_text_from_image_task(page_id):
    from books.models import Page

    page = Page.objects.get(id=page_id)
    page.text = extract_text_from_image(page.image)
    page.status = Page.Status.READY
    page.save()
