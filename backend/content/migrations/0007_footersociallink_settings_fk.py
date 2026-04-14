from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('content', '0006_footersociallink'),
    ]

    operations = [
        migrations.AddField(
            model_name='footersociallink',
            name='settings',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='socials',
                to='content.footersettings',
                verbose_name='Налаштування',
            ),
        ),
    ]
