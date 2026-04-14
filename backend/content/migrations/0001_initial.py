# Generated migration for content app

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name='FooterSettings',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('company_name', models.CharField(default='Зелений куточок', max_length=255, verbose_name='Назва компанії')),
                ('copyright_text', models.CharField(blank=True, help_text='Залиште порожнім для автоматичного генерування', max_length=500, verbose_name='Текст авторських прав')),
                ('phone', models.CharField(blank=True, max_length=50, verbose_name='Телефон')),
                ('email', models.EmailField(blank=True, max_length=254, verbose_name='Email')),
                ('address', models.CharField(blank=True, max_length=500, verbose_name='Адреса')),
                ('facebook_url', models.URLField(blank=True, verbose_name='Facebook')),
                ('instagram_url', models.URLField(blank=True, verbose_name='Instagram')),
                ('telegram_url', models.URLField(blank=True, verbose_name='Telegram')),
            ],
            options={
                'verbose_name': 'Налаштування футера',
                'verbose_name_plural': 'Налаштування футера',
            },
        ),
        migrations.CreateModel(
            name='FooterSection',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=255, verbose_name='Заголовок')),
                ('order', models.PositiveSmallIntegerField(default=0, verbose_name='Порядок')),
                ('is_active', models.BooleanField(default=True, verbose_name='Активна')),
            ],
            options={
                'verbose_name': 'Розділ футера',
                'verbose_name_plural': 'Розділи футера',
                'ordering': ['order', 'id'],
            },
        ),
        migrations.CreateModel(
            name='FooterLink',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('label', models.CharField(max_length=255, verbose_name='Текст посилання')),
                ('url', models.CharField(help_text='Внутрішній шлях: /about або зовнішній: https://...', max_length=500, verbose_name='URL')),
                ('order', models.PositiveSmallIntegerField(default=0, verbose_name='Порядок')),
                ('is_active', models.BooleanField(default=True, verbose_name='Активне')),
                ('section', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='links', to='content.footersection', verbose_name='Розділ')),
            ],
            options={
                'verbose_name': 'Посилання футера',
                'verbose_name_plural': 'Посилання футера',
                'ordering': ['order', 'id'],
            },
        ),
    ]
