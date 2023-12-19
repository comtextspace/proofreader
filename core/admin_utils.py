import functools

from django.contrib import admin
from django.forms import BaseInlineFormSet
from simple_history.admin import SimpleHistoryAdmin


def custom_titled_filter(title, filter_class=admin.FieldListFilter):
    # noinspection PyAbstractClass
    class Wrapper(filter_class):
        def __new__(cls, *args, **kwargs):
            instance = filter_class.create(*args, **kwargs)
            instance.title = title
            return instance

        def __init__(self, *args, **kwargs):
            super().__init__(*args, **kwargs)
            self.title = title

    return Wrapper


class CustomHistoryAdmin(SimpleHistoryAdmin):
    object_history_template = "history/object_history.html"


def add_request_object_to_admin_form(f):
    """Add 'request' to admin form kwargs, need to .pop() it in form __init__"""

    @functools.wraps(f)
    def wrap(self, request, *args, **kwargs):
        # You can change request in function
        AdminForm = f(self, request, *args, **kwargs)
        assert AdminForm is not None, (
            'the function wrapped in @add_request_object_to_admin_form ' 'decorator must return request object'
        )

        new_form = type(AdminForm.__name__, (AdminForm,), {'request': request})
        if issubclass(new_form, BaseInlineFormSet):
            new_form.form = type(new_form.form.__name__, (new_form.form,), {'request': request})
        return new_form

    return wrap
