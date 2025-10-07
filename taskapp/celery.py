import os
from pathlib import Path

import environ
from celery import Celery
from django.apps import AppConfig, apps
from django.conf import settings

if not settings.configured:
    BASE_DIR = Path(__file__).resolve().parent.parent
    env = environ.Env()
    env.read_env(str(BASE_DIR / 'config.env'))

    # set the default Django settings module for the 'celery' program.
    print(
        'Celery settings module is {}'.format(
            os.environ.setdefault(
                'DJANGO_SETTINGS_MODULE', env('DJANGO_SETTINGS_MODULE', default='proofreader.settings')
            )
        )
    )

app = Celery(__name__)
app.config_from_object('django.conf:settings', namespace='CELERY')

app.conf.beat_schedule = {}


class CeleryAppConfig(AppConfig):
    name = 'taskapp'
    verbose_name = 'Celery Config'

    def ready(self):
        installed_apps = [app_config.name for app_config in apps.get_app_configs()]
        app.autodiscover_tasks(lambda: installed_apps, force=True)
