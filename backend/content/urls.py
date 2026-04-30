from django.urls import path
from .views import (
    FooterAPIView, AboutContentAPIView, ContactContentAPIView,
    StaticPageDetailView, SiteReviewListCreateView, SiteReviewMyView,
)

urlpatterns = [
    path('footer/', FooterAPIView.as_view(), name='footer'),
    path('about/', AboutContentAPIView.as_view(), name='about-content'),
    path('contact/', ContactContentAPIView.as_view(), name='contact-content'),
    path('pages/<slug:slug>/', StaticPageDetailView.as_view(), name='static-page-detail'),
    path('reviews/', SiteReviewListCreateView.as_view(), name='site-reviews'),
    path('reviews/my/', SiteReviewMyView.as_view(), name='site-review-my'),
]
