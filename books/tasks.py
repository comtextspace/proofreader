import logging

from django.conf import settings
from django.core.files.base import ContentFile
from PyPDF2 import PdfReader

from books.services.image_actions import extract_text_from_image
from books.services.pdf_actions import split_pdf_to_pages
from taskapp.celery import app

logger = logging.getLogger(__name__)


@app.task(
    trail=False,
)
def split_pdf_to_pages_task(book_id, start_page=1):
    from books.models import Book, Page

    book = Book.objects.get(id=book_id)
    book.total_pages_in_pdf = len(PdfReader(book.pdf).pages)
    book.save()

    for page_number, page_image, image_name in split_pdf_to_pages(book.pdf, book.name, start_page=start_page):
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
    text, ocr_data = extract_text_from_image(page.image)
    page.text = text
    page.ocr_data = ocr_data

    if settings.LLM_CORRECTION_ENABLED:
        page.save(update_fields=['text', 'ocr_data'])
        correct_text_with_llm_task.delay(page.id)
    else:
        page.status = Page.Status.READY
        page.save()


@app.task(
    acks_late=True,
    retry_backoff=True,
    retry_backoff_max=120,
    retry_jitter=True,
    retry_kwargs={'max_retries': 3},
    trail=False,
    soft_time_limit=600,
    time_limit=660,
)
def correct_text_with_llm_task(page_id):
    from books.models import Page
    from books.services.llm_correction.client import OllamaClient
    from books.services.llm_correction.correction import correct_text

    page = Page.objects.get(id=page_id)

    client = OllamaClient()
    if not client.is_available():
        logger.error("Ollama service is not available for page %s", page_id)
        raise Exception("Ollama service is not available")

    corrected = correct_text(page.text, client)
    page.text = corrected
    page.status = Page.Status.READY
    page.save()
