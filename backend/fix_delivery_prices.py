import django, os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'growmart.settings')
django.setup()
from orders.models import DeliveryMethod

updates = [
    ('nova_poshta', 'Нова Пошта',  50, True,  0),
    ('ukr_poshta',  'Укрпошта',    30, True,  1),
    ('courier',     "Кур'єр",     100, True,  2),
    ('pickup',      'Самовивіз',    0, True,  3),
]
for code, name, price, active, order in updates:
    DeliveryMethod.objects.filter(code=code).update(
        name=name, price=price, is_active=active, sort_order=order
    )
print('Done:', list(DeliveryMethod.objects.values('code', 'price', 'is_active')))
