from django.contrib.auth import get_user_model
from django.contrib.auth.forms import UserChangeForm, UserCreationForm
from django.forms import fields


class CustomUserCreationForm(UserCreationForm):
    code = fields.CharField(label='Кодовое слово', max_length=50, required=True)

    class Meta:
        model = get_user_model()
        fields = list(UserCreationForm.Meta.fields) + ["code"]

    def clean(self):
        super().clean()
        code = self.cleaned_data["code"]
        if code.lower() != "текстология":
            raise fields.ValidationError("Неверное кодовое слово")

        return self.cleaned_data

    def save(self, commit=True):
        user = get_user_model().objects.create_user(
            username=self.cleaned_data["username"],
        )
        user.set_password(self.cleaned_data["password1"])
        if commit:
            user.save()
            if hasattr(self, "save_m2m"):
                self.save_m2m()
        return user


class CustomUserChangeForm(UserChangeForm):
    class Meta:
        model = get_user_model()
        fields = UserChangeForm.Meta.fields
