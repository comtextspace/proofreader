from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('books', '0030_merge_0029_bookmark_name_0029_page_ocr_data'),
    ]

    operations = [
        migrations.AddField(
            model_name='book',
            name='images_pdf',
            field=models.FileField(blank=True, null=True, upload_to='exports/', verbose_name='PDF сканов'),
        ),
    ]
