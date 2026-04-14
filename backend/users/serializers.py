from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model, authenticate
from django.utils.translation import gettext_lazy as _

User = get_user_model()


class EmailOrUsernameTokenSerializer(TokenObtainPairSerializer):
    """Allow login with either username or email"""
    def validate(self, attrs):
        login = attrs.get('username', '')
        password = attrs.get('password', '')

        # If the value looks like an email, look up the username
        if '@' in login:
            try:
                user_obj = User.objects.get(email__iexact=login)
                attrs['username'] = user_obj.username
            except User.DoesNotExist:
                raise serializers.ValidationError(
                    {'detail': _('Не знайдено акаунт з таким email')}
                )

        return super().validate(attrs)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'phone', 
                  'date_of_birth', 'avatar', 'address', 'city', 'postal_code', 
                  'country', 'is_verified', 'created_at']
        read_only_fields = ['id', 'is_verified', 'created_at']


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm', 'first_name', 
                  'last_name', 'phone']

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("Паролі не співпадають")
        return data

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user
