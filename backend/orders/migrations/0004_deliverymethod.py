from django.db import migrations, models
import django.core.validators


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0003_order_user_nullable'),
    ]

    operations = [
        migrations.CreateModel(
            name='DeliveryMethod',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('code', models.CharField(max_length=30, unique=True, verbose_name='Код')),
                ('name', models.CharField(max_length=100, verbose_name='Назва')),
                ('price', models.DecimalField(decimal_places=2, default=0, max_digits=8,
                                              validators=[django.core.validators.MinValueValidator(0)],
                                              verbose_name='Вартість (₴)')),
                ('is_active', models.BooleanField(default=True, verbose_name='Активний')),
                ('sort_order', models.PositiveSmallIntegerField(default=0, verbose_name='Порядок сортування')),
            ],
            options={
                'verbose_name': 'Спосіб доставки',
                'verbose_name_plural': 'Способи доставки',
                'ordering': ['sort_order', 'name'],
            },
        ),
    ]
