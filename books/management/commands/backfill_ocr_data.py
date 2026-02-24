from django.core.management.base import BaseCommand

from books.models import Page
from books.services.image_actions import extract_text_from_image


class Command(BaseCommand):
    help = "Backfill OCR bounding box data for existing pages"

    def add_arguments(self, parser):
        parser.add_argument("--book-id", type=str, help="Process only pages of a specific book")
        parser.add_argument("--batch-size", type=int, default=50)

    def handle(self, *args, **options):
        queryset = Page.objects.filter(ocr_data__isnull=True).exclude(image="")
        if options["book_id"]:
            queryset = queryset.filter(book_id=options["book_id"])

        total = queryset.count()
        self.stdout.write(f"Found {total} pages to process")

        for i, page in enumerate(queryset.iterator(chunk_size=options["batch_size"]), 1):
            try:
                _, ocr_data = extract_text_from_image(page.image)
                page.ocr_data = ocr_data
                page.save(update_fields=["ocr_data"])
                self.stdout.write(f"[{i}/{total}] Processed page {page.id}")
            except Exception as e:
                self.stderr.write(f"[{i}/{total}] Failed page {page.id}: {e}")

        self.stdout.write(self.style.SUCCESS("Backfill complete"))
