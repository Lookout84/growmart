from django.urls import path
from .views import FooterAPIView, AboutContentAPIView, ContactContentAPIView

urlpatterns = [
    path('footer/', FooterAPIView.as_view(), name='footer'),
    path('about/', AboutContentAPIView.as_view(), name='about-content'),
    path('contact/', ContactContentAPIView.as_view(), name='contact-content'),
]
