from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('content', '0008_merge_20260405_1844'),
    ]

    operations = [
        migrations.CreateModel(
            name='AboutContent',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('history_title', models.CharField(default='Від маленького розсадника — до лідера ринку', max_length=200, verbose_name='Заголовок «Наша історія»')),
                ('history_text_1', models.TextField(default='«Зелений Куточок» — це сімейна компанія з багаторічним досвідом у вирощуванні та реалізації саджанців ягідних культур. Ми почали свою діяльність з невеликого розсадника і за роки праці виросли в одного з провідних постачальників якісного посадкового матеріалу в Україні.', verbose_name='Текст 1-й абзац')),
                ('history_text_2', models.TextField(default="Сьогодні ми вирощуємо понад 100 сортів малини, полуниці, смородини, аґрусу та інших ягідних культур. Кожен саджанець вирощується з любов'ю та відповідальністю.", verbose_name='Текст 2-й абзац')),
                ('stat1_number', models.CharField(default='10+', max_length=20, verbose_name='Показник 1 — число')),
                ('stat1_label', models.CharField(default='Років досвіду', max_length=100, verbose_name='Показник 1 — підпис')),
                ('stat1_icon', models.CharField(default='🏆', max_length=10, verbose_name='Показник 1 — іконка')),
                ('stat2_number', models.CharField(default='50 000+', max_length=20, verbose_name='Показник 2 — число')),
                ('stat2_label', models.CharField(default='Задоволених клієнтів', max_length=100, verbose_name='Показник 2 — підпис')),
                ('stat2_icon', models.CharField(default='😊', max_length=10, verbose_name='Показник 2 — іконка')),
                ('stat3_number', models.CharField(default='100+', max_length=20, verbose_name='Показник 3 — число')),
                ('stat3_label', models.CharField(default='Сортів рослин', max_length=100, verbose_name='Показник 3 — підпис')),
                ('stat3_icon', models.CharField(default='🌸', max_length=10, verbose_name='Показник 3 — іконка')),
                ('stat4_number', models.CharField(default='98%', max_length=20, verbose_name='Показник 4 — число')),
                ('stat4_label', models.CharField(default='Приживлення саджанців', max_length=100, verbose_name='Показник 4 — підпис')),
                ('stat4_icon', models.CharField(default='✅', max_length=10, verbose_name='Показник 4 — іконка')),
                ('cta_title', models.CharField(default='Готові почати?', max_length=200, verbose_name='CTA заголовок')),
                ('cta_text', models.TextField(default='Перегляньте наш каталог та знайдіть ідеальні саджанці для вашого саду', verbose_name='CTA текст')),
            ],
            options={
                'verbose_name': 'Сторінка «Про нас»',
                'verbose_name_plural': 'Сторінка «Про нас»',
            },
        ),
        migrations.CreateModel(
            name='ContactContent',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('hero_subtitle', models.CharField(default='Ми завжди раді відповісти на ваші питання та допомогти з вибором саджанців', max_length=200, verbose_name='Підзаголовок hero')),
                ('phone1', models.CharField(default='+38 (097) 966-06-92', max_length=30, verbose_name='Телефон 1')),
                ('phone1_href', models.CharField(default='+380979660692', max_length=30, verbose_name='Телефон 1 href')),
                ('phone2', models.CharField(blank=True, default='+38 (095) 766-45-05', max_length=30, verbose_name='Телефон 2')),
                ('phone2_href', models.CharField(blank=True, default='+380957664505', max_length=30, verbose_name='Телефон 2 href')),
                ('email', models.EmailField(default='info@zelenykutochok.ua', max_length=254, verbose_name='Email')),
                ('address', models.CharField(default='Україна', max_length=200, verbose_name='Адреса')),
                ('hours_weekday_label', models.CharField(default='ПН–ПТ', max_length=50, verbose_name='Будняхі — підпис')),
                ('hours_weekday', models.CharField(default='8:00–18:00', max_length=50, verbose_name='Будняхі — години')),
                ('hours_saturday_label', models.CharField(default='СБ', max_length=50, verbose_name='Субота — підпис')),
                ('hours_saturday', models.CharField(default='8:00–15:00', max_length=50, verbose_name='Субота — години')),
                ('hours_sunday_label', models.CharField(default='НД', max_length=50, verbose_name='Неділя — підпис')),
                ('hours_sunday', models.CharField(default='Вихідний', max_length=50, verbose_name='Неділя — години')),
                ('form_subtitle', models.CharField(default='Відповімо протягом одного робочого дня', max_length=200, verbose_name='Підзаголовок форми')),
            ],
            options={
                'verbose_name': 'Сторінка «Контакти»',
                'verbose_name_plural': 'Сторінка «Контакти»',
            },
        ),
    ]
