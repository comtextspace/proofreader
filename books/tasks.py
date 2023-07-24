from PyPDF2 import PdfReader
from django.core.files.base import ContentFile

from taskapp.celery import app


@app.task
def split_pdf_to_pages(book_id):
    from books.models import Book
    from books.models import Page
    book = Book.objects.get(id=book_id)
    pdf = PdfReader(book.pdf)

    for page_number, page_image, image_name in split_pdf_to_pages(book.pdf, book.name):
        page_image = Page(book=book, number=page_number)
        page_image.image.save(image_name, ContentFile(page_image), save=True)
