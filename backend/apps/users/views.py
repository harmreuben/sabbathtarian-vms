from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import generics
from .serializers import CustomTokenObtainPairSerializer, UserSerializer

class LoginView(TokenObtainPairView):
    """Custom login view that returns enriched JWT tokens."""
    serializer_class = CustomTokenObtainPairSerializer

class UserProfileView(generics.RetrieveUpdateAPIView):
    """Allows authenticated users to view and update their profile."""
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user