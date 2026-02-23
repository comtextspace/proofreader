from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('books', '0028_book_is_hidden'),
    ]

    operations = [
        migrations.AddField(
            model_name='page',
            name='ocr_data',
            field=models.JSONField(blank=True, null=True, verbose_name='OCR данные'),
        ),
        migrations.AddField(
            model_name='historicalpage',
            name='ocr_data',
            field=models.JSONField(blank=True, null=True, verbose_name='OCR данные'),
        ),
    ]
