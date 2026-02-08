from rest_framework import generics, permissions

from accounts.models import Assignment
from accounts.serializers import AssignmentSerializer, UserProfileSerializer


class UserProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserProfileSerializer

    def get_object(self):
        return self.request.user


class UserAssignmentsView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = AssignmentSerializer

    def get_queryset(self):
        return Assignment.objects.filter(user=self.request.user).select_related('book')
