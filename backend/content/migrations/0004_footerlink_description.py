from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('content', '0003_footersection_description'),
    ]

    operations = [
        migrations.AddField(
            model_name='footerlink',
            name='description',
            field=models.TextField(
                blank=True,
                verbose_name='Опис',
                help_text='Необовʼязковий пояснювальний текст під посиланням'
            ),
        ),
    ]
