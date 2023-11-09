import uuid
from typing import Tuple

from django.core.exceptions import ObjectDoesNotExist
from django.db import models
from django.db.models.fields.related import RelatedField
from django.urls import reverse
from django.utils.safestring import mark_safe
from django_lifecycle import LifecycleModelMixin
from model_utils.models import TimeStampedModel

from core.utils import make_url_absolute


class ParentModelMeta(models.base.ModelBase):
    def __new__(mcs, name, bases: Tuple[models.Model], attrs, **kwargs):
        new_class = super().__new__(mcs, name, bases, attrs, **kwargs)

        for field in new_class._meta.fields:
            if isinstance(field, RelatedField):
                setattr(new_class, f'admin_{field.name}_link', mcs._admin_related_field_link(field))

        return new_class

    @staticmethod
    def _admin_related_field_link(field: RelatedField):
        def method(self):
            try:
                if getattr(self, field.attname):
                    return getattr(self, field.name).admin_url_tag
            except (ObjectDoesNotExist, AttributeError):
                return ''

        method.short_description = field.verbose_name

        return method


class ParentModelMixin:
    @property
    def admin_url_text(self):
        return self.__str__()

    @property
    def admin_url(self):
        return make_url_absolute(
            reverse(f'admin:{self._meta.app_label}_{self._meta.model_name}_change', args=(self.pk,))
        )

    @property
    def admin_url_tag(self):
        return mark_safe(f'<a href="{self.admin_url}">{self.admin_url_text}</a>')


class BaseParentModel(ParentModelMixin, models.Model, metaclass=ParentModelMeta):
    _created = False

    class Meta:
        abstract = True

    def save(self, *args, **kwargs):
        self._created = self._state.adding
        return super().save(*args, **kwargs)


class SkipSave(Exception):
    """
    You can raise SkipSave in Lifecycle hooks to prevent save
    """

    pass


class LifecycleModelWithSkipSaveMixin(LifecycleModelMixin):
    def save(self, *args, **kwargs):
        try:
            super().save(*args, **kwargs)
        except SkipSave:
            return self


class ParentModel(LifecycleModelWithSkipSaveMixin, BaseParentModel, TimeStampedModel):
    """
    for new models use only ParentModel
    CreatedUpdatedBy conflicts with TimeStampedModel, in this case BaseParentModel can be used with it
    """

    uuid = models.UUIDField(
        unique=True,
        editable=False,
        default=uuid.uuid4,
        verbose_name='Public identifier',
    )

    class Meta:
        abstract = True
