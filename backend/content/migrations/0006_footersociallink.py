from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('content', '0005_merge_20260405_1747'),
    ]

    operations = [
        migrations.CreateModel(
            name='FooterSocialLink',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(help_text='Наприклад: Facebook, Instagram', max_length=100, verbose_name='Назва')),
                ('icon', models.CharField(
                    choices=[
                        ('facebook', 'Facebook'), ('instagram', 'Instagram'),
                        ('telegram', 'Telegram'), ('youtube', 'YouTube'),
                        ('tiktok', 'TikTok'), ('twitter', 'Twitter / X'),
                        ('viber', 'Viber'), ('whatsapp', 'WhatsApp'),
                        ('linkedin', 'LinkedIn'), ('pinterest', 'Pinterest'),
                        ('other', 'Інше'),
                    ],
                    default='other', max_length=20, verbose_name='Іконка'
                )),
                ('url', models.URLField(verbose_name='URL')),
                ('order', models.PositiveSmallIntegerField(default=0, verbose_name='Порядок')),
                ('is_active', models.BooleanField(default=True, verbose_name='Активне')),
            ],
            options={
                'verbose_name': 'Соціальна мережа',
                'verbose_name_plural': 'Соціальні мережі',
                'ordering': ['order', 'id'],
            },
        ),
    ]
