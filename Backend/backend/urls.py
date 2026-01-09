# backend/urls.py
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.decorators.csrf import csrf_exempt

from rest_framework_simplejwt.views import (TokenObtainPairView,TokenRefreshView, TokenBlacklistView,)
from apps.users.views import get_csrf,LoginView,LogoutView

urlpatterns = [
    path("admin/", admin.site.urls),

    path("api/auth/jwt/create/",csrf_exempt(TokenObtainPairView.as_view()),name="jwt_create",),
    path("api/auth/jwt/refresh/", TokenRefreshView.as_view(), name="jwt_refresh"),

    path("api/auth/jwt/blacklist/",csrf_exempt(TokenBlacklistView.as_view()),name="jwt_blacklist",),
     path("api/auth/login/", LoginView.as_view()),
    path("api/auth/logout/", LogoutView.as_view()),
    path("api/csrf/", get_csrf, name="get-csrf"),
    path("api/users/", include(("apps.users.urls", "users"), namespace="users")),
    path("api/appointments/",include(("apps.appointments.urls", "appointments"), namespace="appointments"),),
    path("api/otp/", include(("apps.otp.urls", "otp"), namespace="otp")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
