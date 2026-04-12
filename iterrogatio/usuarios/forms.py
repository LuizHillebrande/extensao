from django import forms
from django.contrib.auth import authenticate
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError


class UserRegisterForm(UserCreationForm):
    email = forms.EmailField(required=True, label='E-mail')

    class Meta:
        model = User
        fields = ['username', 'email', 'password1', 'password2']
        widgets = {
            'username': forms.TextInput(attrs={'placeholder': 'Usuário'}),
            'email': forms.EmailInput(attrs={'placeholder': 'seu@email.com'}),
        }

    def clean_email(self):
        email = self.cleaned_data.get('email')
        if User.objects.filter(email__iexact=email).exists():
            raise ValidationError('Este e-mail já está em uso.')
        return email


class UserLoginForm(forms.Form):
    login = forms.CharField(label='Usuário ou e-mail', max_length=254)
    password = forms.CharField(label='Senha', widget=forms.PasswordInput)
    remember_me = forms.BooleanField(label='Lembrar sessão', required=False)

    def clean(self):
        cleaned_data = super().clean()
        login_value = cleaned_data.get('login')
        password = cleaned_data.get('password')

        if login_value and password:
            user = None
            if '@' in login_value:
                try:
                    user_obj = User.objects.get(email__iexact=login_value)
                    user = authenticate(
                        username=user_obj.username,
                        password=password,
                    )
                except User.DoesNotExist:
                    user = None
            else:
                user = authenticate(username=login_value, password=password)

            if user is None:
                raise ValidationError('Credenciais inválidas. Verifique usuário/e-mail e senha.')

            cleaned_data['user'] = user
        return cleaned_data
