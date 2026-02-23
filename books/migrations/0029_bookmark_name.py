from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('books', '0028_book_is_hidden'),
    ]

    operations = [
        migrations.AddField(
            model_name='bookmark',
            name='name',
            field=models.CharField(blank=True, default='', max_length=200, verbose_name='Название'),
        ),
    ]
