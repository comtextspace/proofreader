from rest_framework import serializers

from accounts.models import Assignment, CustomUser


class UserProfileSerializer(serializers.ModelSerializer):
    is_admin = serializers.BooleanField(read_only=True)
    groups = serializers.SlugRelatedField(slug_field='name', many=True, read_only=True)

    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'is_admin', 'text_size', 'groups']
        read_only_fields = ['id', 'username', 'is_admin', 'groups']


class AssignmentSerializer(serializers.ModelSerializer):
    book_name = serializers.CharField(source='book.name', read_only=True)
    book_id = serializers.UUIDField(source='book.id', read_only=True)

    class Meta:
        model = Assignment
        fields = ['id', 'book_id', 'book_name', 'pages']
