from django.contrib import admin


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
