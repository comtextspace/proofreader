from django.contrib.auth import get_user_model
from rest_framework import serializers

from accounts.models import Assignment, CustomUser


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    code = serializers.CharField(max_length=50)

    def validate_username(self, value):
        if get_user_model().objects.filter(username=value).exists():
            raise serializers.ValidationError("Пользователь с таким именем уже существует")
        return value

    def validate_code(self, value):
        if value.lower() != "текстология":
            raise serializers.ValidationError("Неверное кодовое слово")
        return value

    def validate(self, data):
        if data["password"] != data["password_confirm"]:
            raise serializers.ValidationError({"password_confirm": "Пароли не совпадают"})
        return data

    def create(self, validated_data):
        user = get_user_model().objects.create_user(username=validated_data["username"])
        user.set_password(validated_data["password"])
        user.save()
        return user


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
