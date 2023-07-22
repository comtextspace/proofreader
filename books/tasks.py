import io

from PyPDF2 import PdfReader
from django.core.files.base import ContentFile
from pdf2image import convert_from_bytes

from taskapp.celery import app


@app.task
def split_pdf_to_pages(book_id):
    from books.models import Book
    from books.models import Page
    book = Book.objects.get(id=book_id)
    pdf = PdfReader(book.pdf)

    for page_number, page in enumerate(pdf.pages, 1):
        with book.pdf.open('rb') as pdf_file:
            pdf_bytes = pdf_file.read()
            images = convert_from_bytes(pdf_bytes, dpi=150, first_page=page_number, last_page=page_number)

            # Save the extracted image using ImageField and ContentFile
            image_bytes = io.BytesIO()
            images[0].save(image_bytes, format='PNG')
            image_name = f"{book.name}_page_{page_number}.png"
            page_image = Page(book=book, number=page_number)
            page_image.image.save(image_name, ContentFile(image_bytes.getvalue()), save=True)
