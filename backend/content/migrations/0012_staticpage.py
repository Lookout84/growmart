import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('content', '0011_notificationsettings'),
    ]

    operations = [
        migrations.CreateModel(
            name='StaticPage',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=255, verbose_name='Заголовок')),
                ('slug', models.SlugField(
                    max_length=255, unique=True, verbose_name='URL-ключ (slug)',
                    help_text='Заповнюється автоматично. Сторінка буде доступна за адресою /pages/<slug>',
                )),
                ('content', models.TextField(
                    verbose_name='Вміст сторінки',
                    help_text='Підтримується HTML-розмітка.',
                )),
                ('meta_description', models.CharField(
                    blank=True, max_length=300, verbose_name='Meta-опис (SEO)',
                    help_text='Короткий опис сторінки для пошукових систем (до 300 символів)',
                )),
                ('is_active', models.BooleanField(default=True, verbose_name='Активна')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Створено')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Оновлено')),
                ('footer_link', models.OneToOneField(
                    blank=True, null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name='page',
                    to='content.footerlink',
                    verbose_name='Посилання футера',
                )),
            ],
            options={
                'verbose_name': 'Статична сторінка',
                'verbose_name_plural': 'Статичні сторінки',
                'ordering': ['title'],
            },
        ),
    ]
