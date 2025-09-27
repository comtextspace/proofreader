from django import forms
from django.contrib.admin.helpers import ActionForm
from django.utils.translation import gettext_lazy as _

from accounts.models import PageStatus
from books.models import Page


class PageAdminForm(forms.ModelForm):
    text = forms.CharField(
        widget=forms.Textarea(
            attrs={
                'class': 'modern-textarea resizeable-textarea',
                'rows': 35,
                'cols': 90,
                'placeholder': 'Введите текст страницы...',
                'spellcheck': 'true',
            }
        ),
        label='Text',
        strip=False,
        required=False,
    )

    text_size = forms.IntegerField(
        label='Text Size (px)',
        widget=forms.NumberInput(
            attrs={
                'id': 'text-size-input',
                'class': 'form-control',
                'min': '10',
                'max': '30',
            }
        ),
    )

    status = forms.ChoiceField(
        widget=forms.Select(attrs={'class': 'form-control status-select'}),
        required=True,
    )

    class Meta:
        model = Page
        fields = '__all__'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # if not self.request.user.is_superuser:
        self.filter_statuses_according_to_user_permissions(self.request)

    def filter_statuses_according_to_user_permissions(self, request):
        # set status dropdown values according to user permission group
        statuses = (
            PageStatus.objects.filter(permission_groups__in=request.user.groups.all())
            .distinct()
            .values_list('status', flat=True)
        )

        self.fields['status'].choices = [
            status_tuple for status_tuple in Page.Status.choices if status_tuple[0] in statuses
        ]


class ActionValueForm(ActionForm):
    action_value = forms.CharField(label=_('значение'))
