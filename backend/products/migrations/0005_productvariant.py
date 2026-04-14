from django.db import migrations, models
import django.core.validators
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0004_alter_product_sku'),
    ]

    operations = [
        migrations.CreateModel(
            name='ProductVariant',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(help_text='Наприклад: Відкритий корінь, Закритий корінь 0.5л', max_length=100, verbose_name='Назва варіанту')),
                ('price', models.DecimalField(decimal_places=2, max_digits=10, verbose_name='Ціна')),
                ('stock', models.IntegerField(default=0, validators=[django.core.validators.MinValueValidator(0)], verbose_name='Залишок')),
                ('sort_order', models.PositiveSmallIntegerField(default=0, verbose_name='Порядок')),
                ('is_active', models.BooleanField(default=True, verbose_name='Активний')),
                ('product', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='variants', to='products.product', verbose_name='Товар')),
            ],
            options={
                'verbose_name': 'Варіант товару',
                'verbose_name_plural': 'Варіанти товарів',
                'ordering': ['sort_order', 'name'],
            },
        ),
    ]
