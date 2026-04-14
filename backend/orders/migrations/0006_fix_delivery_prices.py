from django.db import migrations

PRICES = {
    'nova_poshta': 50,
    'ukr_poshta':  30,
    'courier':     100,
    'pickup':      0,
}


def fix_delivery_prices(apps, schema_editor):
    DeliveryMethod = apps.get_model('orders', 'DeliveryMethod')
    for code, price in PRICES.items():
        DeliveryMethod.objects.filter(code=code).update(price=price, is_active=True)


def reverse_fix(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0005_seed_deliverymethods'),
    ]

    operations = [
        migrations.RunPython(fix_delivery_prices, reverse_fix),
    ]
