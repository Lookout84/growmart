from django.db import migrations


def seed_footer(apps, schema_editor):
    FooterSettings = apps.get_model('content', 'FooterSettings')
    FooterSection = apps.get_model('content', 'FooterSection')
    FooterLink = apps.get_model('content', 'FooterLink')

    # Singleton settings
    FooterSettings.objects.get_or_create(
        pk=1,
        defaults={
            'company_name': 'Зелений куточок',
            'phone': '+38 (097) 966-06-92',
            'email': 'info@zelenykutochok.ua',
            'address': 'Україна',
        }
    )

    sections_data = [
        {
            'title': 'Про компанію',
            'order': 1,
            'links': [
                ('Про нас', '/about', 1),
                ('Наші переваги', '/advantages', 2),
                ('Відгуки', '/reviews', 3),
            ],
        },
        {
            'title': 'Покупцям',
            'order': 2,
            'links': [
                ('Оплата і доставка', '/delivery', 1),
                ('Гарантії', '/guarantees', 2),
                ('Повернення', '/returns', 3),
                ('Питання та відповіді', '/faq', 4),
            ],
        },
        {
            'title': 'Каталог',
            'order': 3,
            'links': [
                ('Полуниця', '/products?category=polunycja', 1),
                ('Малина', '/products?category=malyna', 2),
                ('Смородина', '/products?category=smorodyna', 3),
                ('Агрус', '/products?category=ahrus', 4),
            ],
        },
    ]

    for sec in sections_data:
        section, _ = FooterSection.objects.get_or_create(
            title=sec['title'],
            defaults={'order': sec['order']}
        )
        for label, url, order in sec['links']:
            FooterLink.objects.get_or_create(
                section=section,
                label=label,
                defaults={'url': url, 'order': order}
            )


def unseed_footer(apps, schema_editor):
    FooterSection = apps.get_model('content', 'FooterSection')
    FooterSection.objects.filter(
        title__in=['Про компанію', 'Покупцям', 'Каталог']
    ).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('content', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(seed_footer, unseed_footer),
    ]
