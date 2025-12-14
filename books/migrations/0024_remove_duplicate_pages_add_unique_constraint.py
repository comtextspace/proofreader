from django.db import migrations, models


def remove_duplicate_pages(apps, schema_editor):
    """
    Remove duplicate pages keeping the one with the most progress (highest status priority)
    or the oldest one if statuses are equal.

    Status priority (higher = more progress):
    - done: 6
    - check: 5
    - formatting: 4
    - in_progress: 3
    - redy: 2
    - processing: 1
    """
    Page = apps.get_model('books', 'Page')

    status_priority = {
        'done': 6,
        'check': 5,
        'formatting': 4,
        'in_progress': 3,
        'redy': 2,
        'processing': 1,
    }

    # Find all (book, number) combinations that have duplicates
    from django.db.models import Count

    duplicates = Page.objects.values('book', 'number').annotate(count=Count('id')).filter(count__gt=1)

    for dup in duplicates:
        pages = list(Page.objects.filter(book=dup['book'], number=dup['number']).order_by('created'))

        # Sort by status priority (desc) then by created (asc) to keep the best/oldest
        pages_sorted = sorted(pages, key=lambda p: (-status_priority.get(p.status, 0), p.created))

        # Keep the first one (best status, or oldest if equal), delete the rest
        pages_sorted[0]
        pages_to_delete = pages_sorted[1:]

        for page in pages_to_delete:
            page.delete()


def reverse_migration(apps, schema_editor):
    # Cannot restore deleted duplicates
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('books', '0023_book_export_name'),
    ]

    operations = [
        migrations.RunPython(remove_duplicate_pages, reverse_migration),
        migrations.AddConstraint(
            model_name='page',
            constraint=models.UniqueConstraint(
                fields=('book', 'number'),
                name='unique_book_page_number',
            ),
        ),
    ]
