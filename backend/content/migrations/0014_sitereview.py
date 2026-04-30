import django.core.validators
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('content', '0013_alter_footerlink_url_help'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='SiteReview',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('rating', models.PositiveSmallIntegerField(
                    choices=[(1, '1 ★'), (2, '2 ★'), (3, '3 ★'), (4, '4 ★'), (5, '5 ★')],
                    verbose_name='Оцінка',
                )),
                ('title', models.CharField(blank=True, max_length=200, verbose_name='Заголовок')),
                ('comment', models.TextField(verbose_name='Відгук')),
                ('status', models.CharField(
                    choices=[('pending', 'Очікує модерації'), ('approved', 'Опубліковано'), ('rejected', 'Відхилено')],
                    default='pending', max_length=10, verbose_name='Статус',
                )),
                ('admin_note', models.CharField(
                    blank=True, max_length=300,
                    verbose_name='Примітка модератора',
                    help_text='Видно тільки в адмінці',
                )),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Дата')),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='site_reviews',
                    to=settings.AUTH_USER_MODEL,
                    verbose_name='Користувач',
                )),
            ],
            options={
                'verbose_name': 'Відгук про магазин',
                'verbose_name_plural': 'Відгуки про магазин',
                'ordering': ['-created_at'],
                'unique_together': {('user',)},
            },
        ),
    ]
