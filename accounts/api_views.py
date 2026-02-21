from rest_framework import generics, mixins, permissions, status, viewsets
from rest_framework.response import Response

from accounts.models import Assignment
from accounts.serializers import (
    AssignmentCreateSerializer,
    AssignmentSerializer,
    RegisterSerializer,
    UserProfileSerializer,
)


class RegisterView(generics.CreateAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"detail": "Регистрация прошла успешно"}, status=status.HTTP_201_CREATED)


class UserProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserProfileSerializer

    def get_object(self):
        return self.request.user


class UserAssignmentsViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = "id"

    def get_serializer_class(self):
        if self.action == "create":
            return AssignmentCreateSerializer
        return AssignmentSerializer

    def get_queryset(self):
        return Assignment.objects.filter(user=self.request.user).select_related('book')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
