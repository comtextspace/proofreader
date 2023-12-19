from django.conf import settings

from core.utils import get_app_version


def custom_settings(request):
    return {
        'ADMIN_SETTINGS': settings.ADMIN_SETTINGS,
        'APP_VERSION': get_app_version(),
    }
