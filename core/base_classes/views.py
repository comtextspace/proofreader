from django.conf import settings
from django.db.models import QuerySet
from rest_framework import status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.viewsets import GenericViewSet as BaseGenericViewSet

from core.base_classes.serializers import SuccessSerializer


class ParentViewSet(BaseGenericViewSet):
    lookup_field = 'uuid'

    @property
    def method(self):
        if self.action is not None:
            return getattr(self, self.action, None)

    def get_serializer_class(self, validator=False):
        if hasattr(self, 'force_serializer_class'):
            return self.force_serializer_class

        try:
            return getattr(self.method, 'validator_class' if validator else 'serializer_class')
        except AttributeError:
            return super().get_serializer_class()

    def get_serializer(self, *args, validator=False, **kwargs):
        serializer_class = kwargs.pop('serializer_class', None)
        if serializer_class is None:
            serializer_class = self.get_serializer_class(validator=validator)

        kwargs['context'] = self.get_serializer_context()

        return serializer_class(*args, **kwargs)

    def get_validation_serializer(self, *args, **kwargs):
        return self.get_serializer(*args, validator=True, **kwargs)

    def validate_request(self, request, *args, **kwargs):
        if isinstance(request, Request):
            data = request.data
        else:
            data = request  # pragma: no cover

        serializer = self.get_validation_serializer(data=data, *args, **kwargs)
        serializer.is_valid(raise_exception=True)

        return serializer

    def response(self, instance=None, *args, **kwargs):
        if instance is not None:
            if not kwargs.pop('directly', False) and isinstance(instance, (list, dict, tuple)):
                kwargs.setdefault('data', instance)  # pragma: no cover
            else:
                serializer = self.get_serializer(instance, serializer_class=kwargs.pop('serializer_class', None))
                kwargs.setdefault('data', serializer.data)

        return Response(**kwargs)

    def response_list(self, instance, *args, **kwargs):
        serializer = self.get_serializer(instance, many=True, serializer_class=kwargs.pop('serializer_class', None))

        return Response(data=serializer.data, **kwargs)

    def response_ok(self, **kwargs):
        return Response(SuccessSerializer().data, **kwargs)

    def response_empty(self):
        return Response(status=status.HTTP_204_NO_CONTENT)

    def response_error(self, error_message, **kwargs):
        kwargs.setdefault('status', 400)
        return Response({'status': 'error', 'detail': error_message}, **kwargs)

    def get_queryset(self):
        try:
            # noinspection PyUnresolvedReferences
            return super().get_queryset()

        except AssertionError:  # pragma: no cover
            if any(x.endswith('BrowsableAPIRenderer') for x in settings.REST_FRAMEWORK['DEFAULT_RENDERER_CLASSES']):
                return QuerySet().none()

            raise


class serializer:
    def __init__(self, klass, *, validator=None, viewset=None):
        self.viewset = viewset
        self.klass = klass
        self.validator = validator or klass

    def __call__(self, func):
        func.serializer_class = self.klass
        func.validator_class = self.validator

        return func

    def check_viewset(self):
        if self.viewset is None:  # pragma: no cover
            raise ValueError('`viewset` property is required when `serializer()` is used as a context')

        if not isinstance(self.viewset, ParentViewSet):  # pragma: no cover
            raise ValueError('`viewset` should be an instance of `ParentViewSet` object')

    def __enter__(self):
        self.check_viewset()

        setattr(self.viewset, 'force_serializer_class', self.klass)

    def __exit__(self, exc_type, exc_val, exc_tb):
        if hasattr(self.viewset, 'force_serializer_class'):
            delattr(self.viewset, 'force_serializer_class')
