from django.contrib.admin import SimpleListFilter


class ForeignKeyFilter(SimpleListFilter):
    """Filter by related field as input.

    >>> from django.db import models
    >>>
    >>> class CustomFilter(ForeignKeyFilter):
    ...     lookup = 'foreign_field_name'
    ...     title = 'filter name'
    >>>
    >>> @admin.register(models.Model)
    ... class ModelAdmin(admin.ModelAdmin):
    ...     list_filter = (CustomFilter, )
    >>>
    """

    lookup: str = None
    template = 'admin/foreign_key_filter.html'

    def __init__(self, request, params, model, model_admin):
        self.parameter_name = self.lookup
        super().__init__(request, params, model, model_admin)

    def lookups(self, request, model_admin):
        return ((),)

    def queryset(self, request, queryset):
        f_key: str = self.value()
        if f_key and f_key.isnumeric():
            filters = {self.lookup: f_key}
            return queryset.filter(**filters)

    def choices(self, changelist):
        all_choice = next(super().choices(changelist))
        all_choice['query_parts'] = (
            (k, v) for k, v in changelist.get_filters_params().items() if k != self.parameter_name
        )
        yield all_choice
