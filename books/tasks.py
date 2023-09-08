from PyPDF2 import PdfReader
from django.core.files.base import ContentFile

from books.services.image_actions import extract_text_from_image
from books.services.pdf_actions import split_pdf_to_pages
from taskapp.celery import app


@app.task
def split_pdf_to_pages_task(book_id):
    from books.models import Book
    from books.models import Page
    book = Book.objects.get(id=book_id)
    pdf = PdfReader(book.pdf)

    for page_number, page_image, image_name in split_pdf_to_pages(book.pdf, book.name):
        page = Page(book=book, number=page_number)
        page.image.save(image_name, ContentFile(page_image), save=True)


@app.task
def extract_text_from_image_task(page_id):
    from books.models import Page

    page = Page.objects.get(id=page_id)
    page.text = extract_text_from_image(page.image)
    page.status = Page.Status.READY
    page.save()
