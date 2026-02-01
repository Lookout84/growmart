from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
from django.utils import timezone
from .models import User


@receiver(post_save, sender=User)
def send_verification_email(sender, instance, created, **kwargs):
    """Send verification confirmation email when user is verified"""
    # Відправити емейл тільки якщо користувач був верифіков (не при створенні, а при оновленні)
    if not created and instance.is_verified:
        # Перевірити, чи користувач був верифіков до цього
        try:
            previous_instance = User.objects.get(pk=instance.pk)
            if not previous_instance.is_verified:  # Був змінений на верифіковано
                send_verification_confirmation_email(instance)
        except User.DoesNotExist:
            pass


def send_verification_confirmation_email(user):
    """Send email confirmation when user is verified"""
    try:
        subject = '✅ Ваш акаунт верифіковано | Зелений куточок'
        
        context = {
            'user': user,
            'first_name': user.first_name or user.username,
            'site_name': 'Зелений куточок',
            'current_year': timezone.now().year,
        }
        
        html_message = render_to_string('emails/verification_confirmation.html', context)
        
        send_mail(
            subject,
            f'Ваш акаунт успішно верифіковано! Тепер ви можете користуватися всіма функціями.',
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            html_message=html_message,
            fail_silently=True,
        )
    except Exception as e:
        print(f"Помилка при відправці емейлу верифікації: {str(e)}")
