from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('content', '0015_notificationsettings_email_use_ssl'),
    ]

    operations = [
        migrations.CreateModel(
            name='SiteVisitCounter',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('count', models.PositiveBigIntegerField(default=0, verbose_name='Кількість відвідувань')),
            ],
            options={
                'verbose_name': 'Лічильник відвідувань',
                'verbose_name_plural': 'Лічильник відвідувань',
            },
        ),
    ]
