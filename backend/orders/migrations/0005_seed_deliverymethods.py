from django.db import migrations

DEFAULTS = [
    ('nova_poshta', 'Нова Пошта',  50,  0),
    ('ukr_poshta',  'Укрпошта',    30,  1),
    ('courier',     "Кур'єр",     100,  2),
    ('pickup',      'Самовивіз',    0,  3),
]


def seed_delivery_methods(apps, schema_editor):
    DeliveryMethod = apps.get_model('orders', 'DeliveryMethod')
    for code, name, price, sort_order in DEFAULTS:
        DeliveryMethod.objects.update_or_create(
            code=code,
            defaults={'name': name, 'price': price, 'sort_order': sort_order, 'is_active': True},
        )


def unseed_delivery_methods(apps, schema_editor):
    DeliveryMethod = apps.get_model('orders', 'DeliveryMethod')
    DeliveryMethod.objects.filter(code__in=[c for c, *_ in DEFAULTS]).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0004_deliverymethod'),
    ]

    operations = [
        migrations.RunPython(seed_delivery_methods, unseed_delivery_methods),
    ]
