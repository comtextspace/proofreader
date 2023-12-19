# Generated by Django 4.2.7 on 2023-12-17 14:37

from django.db import migrations


def skip_done_page_statuses_to_formatting(apps, schema_editor):
    Page = apps.get_model('books', 'Page')

    for page in Page.objects.filter(status="done"):
        page.status = "formatting"
        page.save()


class Migration(migrations.Migration):
    dependencies = [
        ('books', '0018_alter_book_author_alter_book_name'),
    ]

    operations = [
        migrations.RunPython(skip_done_page_statuses_to_formatting, migrations.RunPython.noop),
    ]
