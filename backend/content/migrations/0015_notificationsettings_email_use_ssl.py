from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('content', '0014_sitereview'),
    ]

    operations = [
        migrations.AddField(
            model_name='notificationsettings',
            name='email_use_ssl',
            field=models.BooleanField(
                default=False,
                verbose_name='Використовувати SSL',
                help_text='Для порту 465. Ukr.net, Meta.ua, деякі хостинги — SSL. TLS і SSL не можна вмикати одночасно.',
            ),
        ),
        migrations.AlterField(
            model_name='notificationsettings',
            name='email_use_tls',
            field=models.BooleanField(
                default=True,
                verbose_name='Використовувати TLS (STARTTLS)',
                help_text='Для порту 587. Gmail, Outlook, SendGrid — TLS.',
            ),
        ),
    ]
