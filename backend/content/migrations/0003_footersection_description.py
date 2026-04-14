from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('content', '0002_seed_footer'),
    ]

    operations = [
        migrations.AddField(
            model_name='footersection',
            name='description',
            field=models.TextField(
                blank=True,
                verbose_name='Текст під заголовком',
                help_text='Необовʼязковий текст, що відображається під заголовком розділу'
            ),
        ),
    ]
