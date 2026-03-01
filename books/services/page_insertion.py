from django.db import transaction


def insert_pages_for_book(book, insert_after, image_files):
    """
    Insert new pages into a book at a specific position.

    Args:
        book: Book instance
        insert_after: int, page number after which to insert (0 = beginning)
        image_files: list of UploadedFile objects, already sorted in desired order
    """
    from books.models import Page

    count = len(image_files)

    with transaction.atomic():
        # Renumber existing pages above insertion point.
        # Go highest-to-lowest to avoid unique constraint (book, number) violations.
        pages_to_shift = Page.objects.filter(book=book, number__gt=insert_after).order_by("-number")

        for page in pages_to_shift:
            page.number = page.number + count
            page.save(update_fields=["number"])

        # Create new pages at the freed positions.
        # Saving with image triggers OCR via lifecycle hook automatically.
        for i, image_file in enumerate(image_files, start=1):
            new_number = insert_after + i
            page = Page(book=book, number=new_number)
            ext = _get_extension(image_file.name)
            image_name = f"{book.name}_{new_number}.{ext}"
            page.image.save(image_name, image_file, save=True)


def _get_extension(filename):
    parts = filename.rsplit(".", 1)
    return parts[1].lower() if len(parts) > 1 else "png"
