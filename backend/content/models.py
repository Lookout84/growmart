from django.db import models


class FooterSettings(models.Model):
    """Global footer settings (singleton)"""
    company_name = models.CharField(max_length=255, default='Зелений куточок', verbose_name='Назва компанії')
    copyright_text = models.CharField(max_length=500, blank=True, verbose_name='Текст авторських прав',
                                      help_text='Залиште порожнім для автоматичного генерування')
    phone = models.CharField(max_length=50, blank=True, verbose_name='Телефон')
    email = models.EmailField(blank=True, verbose_name='Email')
    address = models.CharField(max_length=500, blank=True, verbose_name='Адреса')
    facebook_url = models.URLField(blank=True, verbose_name='Facebook')
    instagram_url = models.URLField(blank=True, verbose_name='Instagram')
    telegram_url = models.URLField(blank=True, verbose_name='Telegram')

    class Meta:
        verbose_name = 'Налаштування футера'
        verbose_name_plural = 'Налаштування футера'

    def __str__(self):
        return 'Налаштування футера'

    def save(self, *args, **kwargs):
        # Singleton — only one record
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj


class NotificationSettings(models.Model):
    """Email and Viber notification settings (singleton)"""

    # ── Email ────────────────────────────────────────────────
    email_enabled = models.BooleanField(default=True, verbose_name='Надсилати email-сповіщення')
    email_host = models.CharField(max_length=200, default='smtp.gmail.com', verbose_name='SMTP-сервер')
    email_port = models.PositiveSmallIntegerField(default=587, verbose_name='SMTP-порт')
    email_use_tls = models.BooleanField(default=True, verbose_name='Використовувати TLS')
    email_host_user = models.CharField(max_length=200, blank=True, verbose_name='Логін (email відправника)')
    email_host_password = models.CharField(
        max_length=500, blank=True,
        verbose_name='Пароль / App Password',
        help_text='Для Gmail використовуйте App Password (не основний пароль акаунту)')
    admin_notification_email = models.EmailField(
        blank=True,
        verbose_name='Email адміністратора',
        help_text='На цю адресу надходитимуть сповіщення про нові замовлення')

    # ── Viber ────────────────────────────────────────────────
    viber_enabled = models.BooleanField(default=False, verbose_name='Надсилати Viber-сповіщення')
    viber_bot_token = models.CharField(
        max_length=500, blank=True,
        verbose_name='Viber Bot Token',
        help_text='Отримайте токен на developers.viber.com → My bots → Bot info → Token')
    viber_admin_receiver = models.CharField(
        max_length=200, blank=True,
        verbose_name='Viber User ID адміністратора',
        help_text='Напишіть боту з вашого Viber — отримаєте ID у webhook-події sender.id')

    class Meta:
        verbose_name = 'Налаштування сповіщень'
        verbose_name_plural = 'Налаштування сповіщень'

    def __str__(self):
        return 'Налаштування email та Viber сповіщень'

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj


class FooterSection(models.Model):
    """A column/section in the footer"""
    title = models.CharField(max_length=255, verbose_name='Заголовок')
    description = models.TextField(blank=True, verbose_name='Текст під заголовком',
                                   help_text='Необов\'язковий текст, що відображається під заголовком розділу')
    order = models.PositiveSmallIntegerField(default=0, verbose_name='Порядок')
    is_active = models.BooleanField(default=True, verbose_name='Активна')

    class Meta:
        ordering = ['order', 'id']
        verbose_name = 'Розділ футера'
        verbose_name_plural = 'Розділи футера'

    def __str__(self):
        return self.title


class FooterLink(models.Model):
    """A single link inside a footer section"""
    section = models.ForeignKey(FooterSection, on_delete=models.CASCADE,
                                related_name='links', verbose_name='Розділ')
    label = models.CharField(max_length=255, verbose_name='Текст посилання')
    url = models.CharField(max_length=500, verbose_name='URL',
                           help_text='Внутрішній шлях: /about або зовнішній: https://...')
    description = models.TextField(blank=True, verbose_name='Опис',
                                   help_text='Необов\'язковий пояснювальний текст під посиланням')
    order = models.PositiveSmallIntegerField(default=0, verbose_name='Порядок')
    is_active = models.BooleanField(default=True, verbose_name='Активне')

    class Meta:
        ordering = ['order', 'id']
        verbose_name = 'Посилання футера'
        verbose_name_plural = 'Посилання футера'

    def __str__(self):
        return f'{self.section.title} → {self.label}'


class FooterSocialLink(models.Model):
    """A social network link displayed in the footer"""
    ICON_CHOICES = [
        ('facebook', 'Facebook'),
        ('instagram', 'Instagram'),
        ('telegram', 'Telegram'),
        ('youtube', 'YouTube'),
        ('tiktok', 'TikTok'),
        ('twitter', 'Twitter / X'),
        ('viber', 'Viber'),
        ('whatsapp', 'WhatsApp'),
        ('linkedin', 'LinkedIn'),
        ('pinterest', 'Pinterest'),
        ('other', 'Інше'),
    ]
    settings = models.ForeignKey('FooterSettings', on_delete=models.CASCADE,
                                 related_name='socials', null=True, blank=True,
                                 verbose_name='Налаштування')
    name = models.CharField(max_length=100, verbose_name='Назва',
                            help_text='Наприклад: Facebook, Instagram')
    icon = models.CharField(max_length=20, choices=ICON_CHOICES, default='other',
                            verbose_name='Іконка')
    url = models.URLField(verbose_name='URL')
    order = models.PositiveSmallIntegerField(default=0, verbose_name='Порядок')
    is_active = models.BooleanField(default=True, verbose_name='Активне')

    class Meta:
        ordering = ['order', 'id']
        verbose_name = 'Соціальна мережа'
        verbose_name_plural = 'Соціальні мережі'

    def __str__(self):
        return self.name


class AboutContent(models.Model):
    """About page content (singleton)"""
    history_title = models.CharField(
        max_length=200, default='Від маленького розсадника — до лідера ринку',
        verbose_name='Заголовок «Наша історія»')
    history_text_1 = models.TextField(
        default='«Зелений Куточок» — це сімейна компанія з багаторічним досвідом у вирощуванні та реалізації саджанців ягідних культур. Ми почали свою діяльність з невеликого розсадника і за роки праці виросли в одного з провідних постачальників якісного посадкового матеріалу в Україні.',
        verbose_name='Текст 1-й абзац')
    history_text_2 = models.TextField(
        default='Сьогодні ми вирощуємо понад 100 сортів малини, полуниці, смородини, аґрусу та інших ягідних культур. Кожен саджанець вирощується з любов\'ю та відповідальністю.',
        verbose_name='Текст 2-й абзац')

    stat1_number = models.CharField(max_length=20, default='10+', verbose_name='Показник 1 — число')
    stat1_label = models.CharField(max_length=100, default='Років досвіду', verbose_name='Показник 1 — підпис')
    stat1_icon = models.CharField(max_length=10, default='🏆', verbose_name='Показник 1 — іконка')
    stat2_number = models.CharField(max_length=20, default='50 000+', verbose_name='Показник 2 — число')
    stat2_label = models.CharField(max_length=100, default='Задоволених клієнтів', verbose_name='Показник 2 — підпис')
    stat2_icon = models.CharField(max_length=10, default='😊', verbose_name='Показник 2 — іконка')
    stat3_number = models.CharField(max_length=20, default='100+', verbose_name='Показник 3 — число')
    stat3_label = models.CharField(max_length=100, default='Сортів рослин', verbose_name='Показник 3 — підпис')
    stat3_icon = models.CharField(max_length=10, default='🌸', verbose_name='Показник 3 — іконка')
    stat4_number = models.CharField(max_length=20, default='98%', verbose_name='Показник 4 — число')
    stat4_label = models.CharField(max_length=100, default='Приживлення саджанців', verbose_name='Показник 4 — підпис')
    stat4_icon = models.CharField(max_length=10, default='✅', verbose_name='Показник 4 — іконка')

    cta_title = models.CharField(max_length=200, default='Готові почати?', verbose_name='CTA заголовок')
    cta_text = models.TextField(
        default='Перегляньте наш каталог та знайдіть ідеальні саджанці для вашого саду',
        verbose_name='CTA текст')

    class Meta:
        verbose_name = 'Сторінка «Про нас»'
        verbose_name_plural = 'Сторінка «Про нас»'

    def __str__(self):
        return 'Вміст сторінки «Про нас»'

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj


class ContactContent(models.Model):
    """Contact page content (singleton)"""
    hero_subtitle = models.CharField(
        max_length=200,
        default='Ми завжди раді відповісти на ваші питання та допомогти з вибором саджанців',
        verbose_name='Підзаголовок hero')

    phone1 = models.CharField(max_length=30, default='+38 (097) 966-06-92', verbose_name='Телефон 1')
    phone1_href = models.CharField(max_length=30, default='+380979660692', verbose_name='Телефон 1 href')
    phone2 = models.CharField(max_length=30, blank=True, default='+38 (095) 766-45-05', verbose_name='Телефон 2')
    phone2_href = models.CharField(max_length=30, blank=True, default='+380957664505', verbose_name='Телефон 2 href')

    email = models.EmailField(default='info@zelenykutochok.ua', verbose_name='Email')
    address = models.CharField(max_length=200, default='Україна', verbose_name='Адреса')

    hours_weekday_label = models.CharField(max_length=50, default='ПН–ПТ', verbose_name='Буднях — підпис')
    hours_weekday = models.CharField(max_length=50, default='8:00–18:00', verbose_name='Буднях — години')
    hours_saturday_label = models.CharField(max_length=50, default='СБ', verbose_name='Субота — підпис')
    hours_saturday = models.CharField(max_length=50, default='8:00–15:00', verbose_name='Субота — години')
    hours_sunday_label = models.CharField(max_length=50, default='НД', verbose_name='Неділя — підпис')
    hours_sunday = models.CharField(max_length=50, default='Вихідний', verbose_name='Неділя — години')

    form_subtitle = models.CharField(
        max_length=200, default='Відповімо протягом одного робочого дня',
        verbose_name='Підзаголовок форми')

    class Meta:
        verbose_name = 'Сторінка «Контакти»'
        verbose_name_plural = 'Сторінка «Контакти»'

    def __str__(self):
        return 'Вміст сторінки «Контакти»'

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj
