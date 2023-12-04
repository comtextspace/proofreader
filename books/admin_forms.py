from django import forms
from django.contrib.admin.helpers import ActionForm
from django.utils.translation import gettext_lazy as _

from books.models import Page


class PageAdminForm(forms.ModelForm):
    text = forms.CharField(
        widget=forms.Textarea(attrs={'class': 'resizeable-textarea', 'rows': 60, 'cols': 90}),
        label='Text',
        strip=False,
        required=False,
    )

    text_size = forms.IntegerField(
        label='Text Size (px)',
        widget=forms.NumberInput(attrs={'id': 'text-size-input'}),
    )

    class Meta:
        model = Page
        fields = '__all__'


class ActionValueForm(ActionForm):
    action_value = forms.CharField(label=_('значение'))
