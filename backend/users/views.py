from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.conf import settings
from .serializers import UserSerializer, UserRegistrationSerializer

User = get_user_model()


class UserRegistrationView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]


class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]

class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')

        if not old_password or not new_password:
            return Response(
                {'error': 'Будь ласка, надайте старий та новий пароль'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not user.check_password(old_password):
            return Response(
                {'error': 'Невірний поточний пароль'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if len(new_password) < 8:
            return Response(
                {'error': 'Пароль повинен містити не менше 8 символів'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.set_password(new_password)
        user.save()

        return Response(
            {'message': 'Пароль успішно змінено'},
            status=status.HTTP_200_OK
        )


class PasswordResetRequestView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip()
        if not email:
            return Response({'error': 'Вкажіть email'}, status=status.HTTP_400_BAD_REQUEST)

        # Always return success to avoid email enumeration
        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            return Response({'message': 'Якщо цей email зареєстрований, ви отримаєте лист з інструкціями.'})

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        reset_url = f"https://zelenyi-kutochok.com.ua/reset-password/{uid}/{token}"

        try:
            from content.models import NotificationSettings
            ns = NotificationSettings.load()
        except Exception:
            ns = None

        from_email = (ns.email_host_user if ns and ns.email_host_user
                      else getattr(settings, 'EMAIL_HOST_USER', 'noreply@zelenyi-kutochok.com.ua'))

        try:
            from django.template.loader import render_to_string
            html_body = render_to_string('emails/password_reset.html', {
                'user': user,
                'reset_url': reset_url,
            })
            if ns and ns.email_host_user and ns.email_host_password:
                import smtplib, ssl as ssl_lib
                from email.mime.multipart import MIMEMultipart
                from email.mime.text import MIMEText
                msg = MIMEMultipart('alternative')
                msg['Subject'] = 'Відновлення пароля — Зелений куточок'
                msg['From'] = from_email
                msg['To'] = email
                msg.attach(MIMEText(f'Перейдіть за посиланням: {reset_url}', 'plain', 'utf-8'))
                msg.attach(MIMEText(html_body, 'html', 'utf-8'))
                ssl_ctx = ssl_lib.create_default_context()
                use_ssl = getattr(ns, 'email_use_ssl', False)
                use_tls = getattr(ns, 'email_use_tls', True)
                if use_ssl:
                    with smtplib.SMTP_SSL(ns.email_host, ns.email_port, context=ssl_ctx, timeout=10) as s:
                        s.login(ns.email_host_user, ns.email_host_password)
                        s.sendmail(from_email, [email], msg.as_bytes())
                else:
                    with smtplib.SMTP(ns.email_host, ns.email_port, timeout=10) as s:
                        if use_tls:
                            s.starttls(context=ssl_ctx)
                        s.login(ns.email_host_user, ns.email_host_password)
                        s.sendmail(from_email, [email], msg.as_bytes())
            else:
                send_mail(
                    'Відновлення пароля — Зелений куточок',
                    f'Перейдіть за посиланням: {reset_url}',
                    from_email, [email],
                    html_message=html_body, fail_silently=True,
                )
        except Exception as e:
            import logging
            logging.getLogger(__name__).error('Password reset email failed: %s', e)

        return Response({'message': 'Якщо цей email зареєстрований, ви отримаєте лист з інструкціями.'})


class PasswordResetConfirmView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        uid = request.data.get('uid', '')
        token = request.data.get('token', '')
        new_password = request.data.get('new_password', '')

        if not uid or not token or not new_password:
            return Response({'error': 'Невірні дані'}, status=status.HTTP_400_BAD_REQUEST)

        if len(new_password) < 8:
            return Response({'error': 'Пароль повинен містити не менше 8 символів'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            pk = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=pk)
        except Exception:
            return Response({'error': 'Невірне посилання'}, status=status.HTTP_400_BAD_REQUEST)

        if not default_token_generator.check_token(user, token):
            return Response({'error': 'Посилання недійсне або застаріло'}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        return Response({'message': 'Пароль успішно змінено. Тепер ви можете увійти.'})