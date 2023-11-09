from django.contrib import admin
from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType

NO_AUTOCOMPLETE = (ContentType, Permission, Group)


class AutoAutocompleteMixin:
    def get_autocomplete_fields(self, request):
        autocomplete_fields = super().get_autocomplete_fields(request)
        if autocomplete_fields:
            return autocomplete_fields
        autocomplete_fields = []
        # noinspection PyProtectedMember
        for model_field in self.model._meta.get_fields():
            if model_field.related_model in NO_AUTOCOMPLETE:
                continue
            if model_field.many_to_one or model_field.many_to_many:
                autocomplete_fields.append(model_field.name)

        return autocomplete_fields


class ParentAdmin(AutoAutocompleteMixin, admin.ModelAdmin):
    pass


class ReadOnlyAdmin(ParentAdmin):
    def has_change_permission(self, request, obj=None):
        return False

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


class EditOnlyAdmin(ParentAdmin):
    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, **kwargs):
        return False
