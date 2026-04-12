import json

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.utils.translation import gettext as _
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_GET, require_POST

from .forms import UserLoginForm, UserRegisterForm


def _parse_json(request):
    try:
        return json.loads(request.body.decode('utf-8') if request.body else '{}')
    except json.JSONDecodeError:
        return None


def _format_form_errors(form):
    errors = {}
    for field, field_errors in form.errors.items():
        errors[field] = [str(error) for error in field_errors]
    return errors


@ensure_csrf_cookie
@require_GET
def csrf_token_view(request):
    return JsonResponse({'csrfToken': get_token(request)})


@ensure_csrf_cookie
@require_GET
def auth_status(request):
    if request.user.is_authenticated:
        return JsonResponse(
            {
                'authenticated': True,
                'user': {
                    'username': request.user.username,
                    'email': request.user.email,
                },
            }
        )
    return JsonResponse({'authenticated': False})


@require_POST
def register_api(request):
    payload = _parse_json(request)
    if payload is None:
        return JsonResponse({'detail': _('JSON inválido.')}, status=400)

    form = UserRegisterForm(payload)
    if form.is_valid():
        user = form.save()
        login(request, user)
        return JsonResponse(
            {
                'user': {
                    'username': user.username,
                    'email': user.email,
                }
            },
            status=201,
        )

    return JsonResponse({'detail': _('Erro de validação.'), 'errors': _format_form_errors(form)}, status=400)


@require_POST
def login_api(request):
    payload = _parse_json(request)
    if payload is None:
        return JsonResponse({'detail': _('JSON inválido.')}, status=400)

    form = UserLoginForm(payload)
    if form.is_valid():
        user = form.cleaned_data['user']
        login(request, user)
        if form.cleaned_data.get('remember_me'):
            request.session.set_expiry(1209600)
        else:
            request.session.set_expiry(0)
        return JsonResponse(
            {
                'user': {
                    'username': user.username,
                    'email': user.email,
                }
            }
        )

    return JsonResponse({'detail': _('Credenciais inválidas.'), 'errors': _format_form_errors(form)}, status=400)


@require_POST
def logout_api(request):
    logout(request)
    return JsonResponse({'detail': _('Logout efetuado.')})
