from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0006_fix_delivery_prices'),
    ]

    operations = [
        migrations.CreateModel(
            name='PaymentMethod',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('code', models.CharField(max_length=30, unique=True, verbose_name='Код')),
                ('name', models.CharField(max_length=100, verbose_name='Назва')),
                ('is_active', models.BooleanField(default=True, verbose_name='Активний')),
                ('sort_order', models.PositiveSmallIntegerField(default=0, verbose_name='Порядок сортування')),
            ],
            options={
                'verbose_name': 'Спосіб оплати',
                'verbose_name_plural': 'Способи оплати',
                'ordering': ['sort_order', 'name'],
            },
        ),
    ]
