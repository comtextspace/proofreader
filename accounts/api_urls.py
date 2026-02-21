from django.urls import include, path
from rest_framework import routers
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from accounts.api_views import RegisterView, UserAssignmentsViewSet, UserHistoryView, UserProfileView

assignments_router = routers.DefaultRouter(trailing_slash=False)
assignments_router.register('', UserAssignmentsViewSet, basename='user-assignments')

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', UserProfileView.as_view(), name='user_profile'),
    path('me/assignments/', include(assignments_router.urls)),
    path('me/history/', UserHistoryView.as_view(), name='user_history'),
]
