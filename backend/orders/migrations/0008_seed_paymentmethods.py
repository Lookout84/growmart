from django.db import migrations

DEFAULTS = [
    ('cash',   'Готівка при отриманні', 0),
    ('card',   'Оплата карткою',        1),
    ('online', 'Онлайн оплата',         2),
]


def seed_payment_methods(apps, schema_editor):
    PaymentMethod = apps.get_model('orders', 'PaymentMethod')
    for code, name, sort_order in DEFAULTS:
        PaymentMethod.objects.update_or_create(
            code=code,
            defaults={'name': name, 'sort_order': sort_order, 'is_active': True},
        )


def unseed_payment_methods(apps, schema_editor):
    PaymentMethod = apps.get_model('orders', 'PaymentMethod')
    PaymentMethod.objects.filter(code__in=[c for c, *_ in DEFAULTS]).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0007_paymentmethod'),
    ]

    operations = [
        migrations.RunPython(seed_payment_methods, unseed_payment_methods),
    ]
