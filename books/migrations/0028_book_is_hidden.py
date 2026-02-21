from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('books', '0027_bookmark_bookmark_unique_user_page_bookmark'),
    ]

    operations = [
        migrations.AddField(
            model_name='book',
            name='is_hidden',
            field=models.BooleanField(default=False, verbose_name='Скрыта'),
        ),
    ]
