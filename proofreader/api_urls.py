from django.conf import settings
from django.urls import include, path
from drf_yasg import openapi
from drf_yasg.views import get_schema_view
from rest_framework import permissions

app_name = "api"
urlpatterns = [
    path("books/", include("books.api_urls")),
    path("users/", include("accounts.api_urls")),
]

if settings.DEBUG:
    schema_view = get_schema_view(
        openapi.Info(
            title="PROOFREADER API",
            default_version="v1",
            description="private API documentation",
        ),
        public=False,
        permission_classes=[
            permissions.AllowAny,
        ],
    )
    urlpatterns += [
        path(
            "swagger/",
            schema_view.with_ui("swagger", cache_timeout=0),
            name="schema-swagger-ui",
        ),
        path(
            "swagger<str:format>",
            schema_view.without_ui(cache_timeout=0),
            name="schema-json",
        ),
        path("redoc/", schema_view.with_ui("redoc", cache_timeout=0), name="schema-redoc"),
        path("debug/sentry", lambda *args, **kwargs: 1 / 0),
    ]
