from django.conf import settings


def custom_settings(request):
    return {
        'ADMIN_SETTINGS': settings.ADMIN_SETTINGS,
    }
