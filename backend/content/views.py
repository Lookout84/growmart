from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.exceptions import NotFound
from rest_framework import status as http_status
from django.db.models import Avg, Count, F
from .models import FooterSettings, FooterSection, FooterSocialLink, AboutContent, ContactContent, StaticPage, SiteReview, SiteVisitCounter
from .serializers import (
    FooterSettingsSerializer, FooterSectionSerializer, FooterSocialLinkSerializer,
    AboutContentSerializer, ContactContentSerializer, StaticPageSerializer,
    SiteReviewSerializer, SiteReviewCreateSerializer,
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


class VisitCounterView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        counter = SiteVisitCounter.load()
        return Response({'count': counter.count})

    def post(self, request):
        SiteVisitCounter.objects.filter(pk=1).update(count=F('count') + 1)
        SiteVisitCounter.objects.get_or_create(pk=1)
        counter = SiteVisitCounter.load()
        return Response({'count': counter.count})


class AboutContentAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response(AboutContentSerializer(AboutContent.load()).data)


class ContactContentAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response(ContactContentSerializer(ContactContent.load()).data)


class StaticPageDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, slug):
        try:
            page = StaticPage.objects.get(slug=slug, is_active=True)
        except StaticPage.DoesNotExist:
            raise NotFound('Сторінку не знайдено.')
        return Response(StaticPageSerializer(page).data)


class SiteReviewListCreateView(APIView):
    """
    GET  — list of approved reviews + stats (public)
    POST — create review (authenticated, one per user)
    """

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAuthenticated()]
        return [AllowAny()]

    def get(self, request):
        reviews = SiteReview.objects.filter(status='approved').select_related('user')
        agg = reviews.aggregate(avg=Avg('rating'), total=Count('id'))
        distribution = {}
        for i in range(1, 6):
            distribution[str(i)] = reviews.filter(rating=i).count()
        return Response({
            'reviews': SiteReviewSerializer(reviews, many=True).data,
            'avg_rating': round(agg['avg'] or 0, 1),
            'total': agg['total'],
            'distribution': distribution,
        })

    def post(self, request):
        # One review per user
        if SiteReview.objects.filter(user=request.user).exists():
            return Response(
                {'error': 'Ви вже залишили відгук про наш магазин.'},
                status=http_status.HTTP_400_BAD_REQUEST,
            )
        serializer = SiteReviewCreateSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(
                {'message': 'Дякуємо! Ваш відгук відправлено на модерацію.'},
                status=http_status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=http_status.HTTP_400_BAD_REQUEST)


class SiteReviewMyView(APIView):
    """Returns current user's own review (any status)."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            review = SiteReview.objects.get(user=request.user)
            return Response({
                'status': review.status,
                'rating': review.rating,
                'title': review.title,
                'comment': review.comment,
            })
        except SiteReview.DoesNotExist:
            return Response(None)


