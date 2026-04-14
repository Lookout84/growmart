from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .models import FooterSettings, FooterSection, FooterSocialLink, AboutContent, ContactContent
from .serializers import (
    FooterSettingsSerializer, FooterSectionSerializer, FooterSocialLinkSerializer,
    AboutContentSerializer, ContactContentSerializer,
)


class FooterAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        settings = FooterSettings.load()
        sections = FooterSection.objects.filter(is_active=True).prefetch_related('links')
        socials = FooterSocialLink.objects.filter(is_active=True)

        return Response({
            'settings': FooterSettingsSerializer(settings).data,
            'sections': FooterSectionSerializer(sections, many=True).data,
            'socials': FooterSocialLinkSerializer(socials, many=True).data,
        })


class AboutContentAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response(AboutContentSerializer(AboutContent.load()).data)


class ContactContentAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response(ContactContentSerializer(ContactContent.load()).data)
