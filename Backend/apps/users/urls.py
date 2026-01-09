from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, MeView, get_csrf

app_name = 'users'

router = DefaultRouter()
router.register(r'', UserViewSet, basename='user')

urlpatterns = [
    path('me/', MeView.as_view(), name='me'), 
    # path("api/csrf/", get_csrf, name="get-csrf"),
    path('', include(router.urls)),
    
    
]
