from django.urls import path

from . import views

urlpatterns = [
    path('api/auth/csrf/', views.csrf_token_view, name='csrf_token'),
    path('api/auth/user/', views.auth_status, name='auth_status'),
    path('api/auth/register/', views.register_api, name='register_api'),
    path('api/auth/login/', views.login_api, name='login_api'),
    path('api/auth/logout/', views.logout_api, name='logout_api'),
]
