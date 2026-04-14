import logging
import requests
from celery import shared_task
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings

logger = logging.getLogger(__name__)


def _get_order(order_id):
    from .models import Order
    try:
        return Order.objects.prefetch_related('items').select_related('user').get(pk=order_id)
    except Order.DoesNotExist:
        logger.warning("Order %s not found for notification", order_id)
        return None


def _get_notification_settings():
    """Load NotificationSettings from DB (with lazy import to avoid circular deps)."""
    try:
        from content.models import NotificationSettings
        return NotificationSettings.load()
    except Exception:
        return None


# ---------------------------------------------------------------------------
# Email to customer
# ---------------------------------------------------------------------------

@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_order_confirmation_email(self, order_id):
    """Send HTML order confirmation email to the customer."""
    ns = _get_notification_settings()
    if ns and not ns.email_enabled:
        return

    order = _get_order(order_id)
    if not order:
        return

    customer_email = order.email
    if not customer_email:
        return

    # Determine sender
    from_email = (ns.email_host_user if ns and ns.email_host_user
                  else settings.EMAIL_HOST_USER or 'noreply@growmart.ua')

    context = {'order': order, 'items': order.items.all()}
    html_body = render_to_string('emails/order_confirmation.html', context)
    text_body = (
        f"Дякуємо за замовлення #{order.order_number}!\n"
        f"Сума: ₴{order.total}\n"
        f"Статус: {order.get_status_display()}\n"
    )

    try:
        _send_email_with_settings(
            ns=ns,
            subject=f"Замовлення #{order.order_number} прийнято — GrowMart 🌱",
            body=text_body,
            html_body=html_body,
            from_email=from_email,
            to=[customer_email],
        )
        logger.info("Order confirmation email sent to %s", customer_email)
    except Exception as exc:
        logger.error("Failed to send order confirmation email: %s", exc)
        raise self.retry(exc=exc)


# ---------------------------------------------------------------------------
# Email to admin/manager
# ---------------------------------------------------------------------------

@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_new_order_admin_email(self, order_id):
    """Notify the shop admin about a new order via email."""
    ns = _get_notification_settings()
    if ns and not ns.email_enabled:
        return

    admin_email = (ns.admin_notification_email if ns and ns.admin_notification_email
                   else getattr(settings, 'ADMIN_NOTIFICATION_EMAIL', ''))
    if not admin_email:
        return

    order = _get_order(order_id)
    if not order:
        return

    from_email = (ns.email_host_user if ns and ns.email_host_user
                  else settings.EMAIL_HOST_USER or 'noreply@growmart.ua')

    context = {'order': order, 'items': order.items.all()}
    html_body = render_to_string('emails/new_order_admin.html', context)
    items_text = '\n'.join(
        f"  - {i.product_name} x{i.quantity} = ₴{i.total}" for i in order.items.all()
    )
    text_body = (
        f"Нове замовлення #{order.order_number}\n"
        f"Клієнт: {order.first_name} {order.last_name} ({order.email})\n"
        f"Телефон: {order.phone}\n"
        f"Сума: ₴{order.total}\n"
        f"Товари:\n{items_text}\n"
    )

    try:
        _send_email_with_settings(
            ns=ns,
            subject=f"🛒 Нове замовлення #{order.order_number} — GrowMart",
            body=text_body,
            html_body=html_body,
            from_email=from_email,
            to=[admin_email],
        )
        logger.info("Admin order notification email sent for order %s", order.order_number)
    except Exception as exc:
        logger.error("Failed to send admin order email: %s", exc)
        raise self.retry(exc=exc)


def _send_email_with_settings(ns, subject, body, html_body, from_email, to):
    """Send email using credentials from NotificationSettings (DB) if available,
    otherwise fall back to Django settings."""
    import smtplib
    from email.mime.multipart import MIMEMultipart
    from email.mime.text import MIMEText

    if ns and ns.email_host_user and ns.email_host_password:
        # Use DB-stored SMTP credentials directly
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = from_email
        msg['To'] = ', '.join(to)
        msg.attach(MIMEText(body, 'plain', 'utf-8'))
        msg.attach(MIMEText(html_body, 'html', 'utf-8'))

        with smtplib.SMTP(ns.email_host, ns.email_port) as s:
            if ns.email_use_tls:
                s.starttls()
            s.login(ns.email_host_user, ns.email_host_password)
            s.sendmail(from_email, to, msg.as_bytes())
    else:
        # Fall back to Django's EMAIL_* settings
        msg = EmailMultiAlternatives(subject=subject, body=body, from_email=from_email, to=to)
        msg.attach_alternative(html_body, "text/html")
        msg.send()


# ---------------------------------------------------------------------------
# Viber notification to admin
# ---------------------------------------------------------------------------

VIBER_API_URL = "https://chatapi.viber.com/pa/send_message"


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_new_order_viber_notification(self, order_id):
    """Send a Viber message to the shop admin about a new order."""
    ns = _get_notification_settings()

    token = (ns.viber_bot_token if ns and ns.viber_enabled and ns.viber_bot_token
             else getattr(settings, 'VIBER_BOT_TOKEN', ''))
    receiver = (ns.viber_admin_receiver if ns and ns.viber_enabled and ns.viber_admin_receiver
                else getattr(settings, 'VIBER_ADMIN_RECEIVER', ''))

    if not token or not receiver:
        logger.info("Viber not configured, skipping notification for order %s", order_id)
        return

    order = _get_order(order_id)
    if not order:
        return

    items_lines = '\n'.join(
        f"  • {i.product_name} ×{i.quantity} — ₴{i.total}" for i in order.items.all()
    )
    text = (
        f"🌱 *Нове замовлення GrowMart*\n\n"
        f"📦 #{order.order_number}\n"
        f"👤 {order.first_name} {order.last_name}\n"
        f"📞 {order.phone}\n"
        f"📧 {order.email}\n"
        f"📍 {order.city}, {order.address}\n\n"
        f"Товари:\n{items_lines}\n\n"
        f"💰 Доставка: ₴{order.shipping_cost}\n"
        f"💵 Всього: ₴{order.total}"
    )

    payload = {
        "receiver": receiver,
        "min_api_version": 1,
        "sender": {"name": "GrowMart"},
        "tracking_data": f"order_{order.order_number}",
        "type": "text",
        "text": text,
    }
    headers = {
        "X-Viber-Auth-Token": token,
        "Content-Type": "application/json",
    }

    try:
        resp = requests.post(VIBER_API_URL, json=payload, headers=headers, timeout=10)
        data = resp.json()
        if data.get("status") != 0:
            raise ValueError(f"Viber API error: {data.get('status_message')}")
        logger.info("Viber notification sent for order %s", order.order_number)
    except Exception as exc:
        logger.error("Failed to send Viber notification: %s", exc)
        raise self.retry(exc=exc)


# ---------------------------------------------------------------------------
# Admin notification on new review
# ---------------------------------------------------------------------------

@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_new_review_notification(self, review_id):
    """Notify admin by email when a new review is submitted for moderation."""
    ns = _get_notification_settings()
    if ns and not ns.email_enabled:
        return

    admin_email = (
        ns.admin_notification_email if ns and ns.admin_notification_email
        else getattr(settings, 'ADMIN_NOTIFICATION_EMAIL', '')
    )
    if not admin_email:
        logger.info("Admin email not configured, skipping review notification %s", review_id)
        return

    try:
        from products.models import Review
        review = Review.objects.select_related('user', 'product').get(pk=review_id)
    except Exception:
        logger.warning("Review %s not found for notification", review_id)
        return

    user_name = review.user.get_full_name() or review.user.username
    subject = f'⭐ Новий відгук: {review.product.name}'
    stars = '★' * review.rating + '☆' * (5 - review.rating)
    body = (
        f'Новий відгук очікує модерації.\n\n'
        f'Товар: {review.product.name}\n'
        f'Користувач: {user_name}\n'
        f'Рейтинг: {stars}\n'
        f'Відгук: {review.comment}\n\n'
        f'Щоб схвалити або відхилити, перейдіть в адмін-панель.'
    )
    html_body = f'''
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:#10b981;padding:20px;border-radius:8px 8px 0 0;">
        <h2 style="color:white;margin:0;">⭐ Новий відгук очікує модерації</h2>
      </div>
      <div style="background:#f9fafb;padding:24px;border-radius:0 0 8px 8px;border:1px solid #e5e7eb;">
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:8px;font-weight:bold;color:#374151;">Товар:</td>
              <td style="padding:8px;">{review.product.name}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;color:#374151;">Користувач:</td>
              <td style="padding:8px;">{user_name}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;color:#374151;">Рейтинг:</td>
              <td style="padding:8px;color:#f59e0b;font-size:18px;">{stars}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;color:#374151;vertical-align:top;">Відгук:</td>
              <td style="padding:8px;">{review.comment}</td></tr>
        </table>
        <div style="margin-top:20px;text-align:center;">
          <a href="/admin/products/review/" style="background:#10b981;color:white;padding:10px 24px;border-radius:6px;text-decoration:none;font-weight:bold;">
            Відкрити в адмін-панелі
          </a>
        </div>
      </div>
    </div>
    '''

    try:
        from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@growmart.ua')
        _send_email_with_settings(ns, subject, body, html_body, from_email, [admin_email])
        logger.info("Review notification email sent for review %s", review_id)
    except Exception as exc:
        logger.error("Failed to send review notification email: %s", exc)
        raise self.retry(exc=exc)

