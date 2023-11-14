from django.contrib import admin
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
