from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import LoginView, UserProfileView

urlpatterns = [
    path('token/', LoginView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'), # Added this line
    path('me/', UserProfileView.as_view(), name='user_profile'),
]