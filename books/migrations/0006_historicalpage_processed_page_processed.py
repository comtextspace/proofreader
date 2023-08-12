# Generated by Django 4.1 on 2023-07-24 14:55

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("books", "0005_historicalpage_created_historicalpage_modified_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="historicalpage",
            name="processed",
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name="page",
            name="processed",
            field=models.BooleanField(default=False),
        ),
    ]