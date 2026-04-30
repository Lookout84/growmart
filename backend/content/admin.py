import smtplib
from django.contrib import admin
from django.contrib import messages
from django.http import HttpResponseRedirect
from django.urls import path, reverse
from django.utils.html import format_html
from .models import (
    FooterSettings, FooterSection, FooterLink, FooterSocialLink,
    AboutContent, ContactContent, NotificationSettings, StaticPage, SiteReview,
)


class StaticPageInline(admin.StackedInline):
    model = StaticPage
    fk_name = 'footer_link'
    extra = 0
    max_num = 1
    can_delete = True
    verbose_name = 'Сторінка сайту'
    verbose_name_plural = 'Сторінка сайту (заповніть щоб створити)'
    fields = ('title', 'slug', 'content', 'meta_description', 'is_active')
    show_change_link = True

    def get_formset(self, request, obj=None, **kwargs):
        formset = super().get_formset(request, obj, **kwargs)
        # Make content widget taller
        formset.form.base_fields['content'].widget.attrs.update({
            'rows': 20, 'style': 'font-family: monospace; width: 100%;'
        })
        return formset


class FooterLinkInline(admin.StackedInline):
    model = FooterLink
    extra = 3
    fields = ('label', 'url', 'description', 'order', 'is_active')
    ordering = ('order',)
    verbose_name = 'Посилання'
    verbose_name_plural = 'Посилання розділу'


class FooterSocialLinkInline(admin.TabularInline):
    model = FooterSocialLink
    extra = 3
    fields = ('name', 'icon', 'url', 'order', 'is_active')
    ordering = ('order',)
    verbose_name = 'Соціальна мережа'
    verbose_name_plural = 'Соціальні мережі'


@admin.register(FooterSettings)
class FooterSettingsAdmin(admin.ModelAdmin):
    fieldsets = (
        ('Основні дані', {
            'fields': ('company_name', 'copyright_text')
        }),
        ('Контакти', {
            'fields': ('phone', 'email', 'address')
        }),
    )
    inlines = [FooterSocialLinkInline]
    save_on_top = True

    def has_add_permission(self, request):
        # Only one instance allowed
        return not FooterSettings.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(FooterSection)
class FooterSectionAdmin(admin.ModelAdmin):
    list_display = ('title', 'order', 'is_active', 'link_count')
    list_editable = ('order', 'is_active')
    fieldsets = (
        ('Основне', {
            'fields': ('title', 'description', 'order', 'is_active')
        }),
        ('Посилання', {
            'fields': (),
            'description': 'Додайте посилання до цього розділу нижче.',
        }),
    )
    inlines = [FooterLinkInline]
    ordering = ('order',)
    save_on_top = True

    def link_count(self, obj):
        return obj.links.count()
    link_count.short_description = 'К-сть посилань'


@admin.register(FooterLink)
class FooterLinkAdmin(admin.ModelAdmin):
    list_display = ('label', 'section', 'url', 'has_page', 'order', 'is_active')
    list_editable = ('order', 'is_active')
    list_filter = ('section',)
    ordering = ('section', 'order')
    fields = ('section', 'label', 'url', 'description', 'order', 'is_active')
    inlines = [StaticPageInline]

    def has_page(self, obj):
        try:
            page = obj.page
            return format_html(
                '<a href="{}" target="_blank">✅ {}</a>',
                reverse('admin:content_staticpage_change', args=[page.pk]),
                page.title,
            )
        except StaticPage.DoesNotExist:
            return '—'
    has_page.short_description = 'Сторінка'

    def save_related(self, request, form, formsets, change):
        super().save_related(request, form, formsets, change)
        obj = form.instance
        # Auto-fill URL from linked static page slug
        try:
            page = obj.page
            if page and obj.url != f'/pages/{page.slug}':
                obj.url = f'/pages/{page.slug}'
                obj.save(update_fields=['url'])
        except StaticPage.DoesNotExist:
            pass


@admin.register(AboutContent)
class AboutContentAdmin(admin.ModelAdmin):
    fieldsets = (
        ('Розділ "Наша історія"', {
            'fields': ('history_title', 'history_text_1', 'history_text_2'),
        }),
        ('Показники (статистика)', {
            'fields': (
                ('stat1_icon', 'stat1_number', 'stat1_label'),
                ('stat2_icon', 'stat2_number', 'stat2_label'),
                ('stat3_icon', 'stat3_number', 'stat3_label'),
                ('stat4_icon', 'stat4_number', 'stat4_label'),
            ),
        }),
        ('Банер заклику до дії', {
            'fields': ('cta_title', 'cta_text'),
        }),
    )
    save_on_top = True

    def has_add_permission(self, request):
        return not AboutContent.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False

    def changelist_view(self, request, extra_context=None):
        obj, _ = AboutContent.objects.get_or_create(pk=1)
        return HttpResponseRedirect(
            reverse('admin:content_aboutcontent_change', args=[obj.pk])
        )


@admin.register(ContactContent)
class ContactContentAdmin(admin.ModelAdmin):
    fieldsets = (
        ('Hero', {
            'fields': ('hero_subtitle',),
        }),
        ('Контактні дані', {
            'fields': ('phone1', 'phone1_href', 'phone2', 'phone2_href', 'email', 'address'),
        }),
        ('Графік роботи', {
            'fields': (
                ('hours_weekday_label', 'hours_weekday'),
                ('hours_saturday_label', 'hours_saturday'),
                ('hours_sunday_label', 'hours_sunday'),
            ),
        }),
        ('Форма зворотного зв\'язку', {
            'fields': ('form_subtitle',),
        }),
    )
    save_on_top = True

    def has_add_permission(self, request):
        return not ContactContent.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False

    def changelist_view(self, request, extra_context=None):
        obj, _ = ContactContent.objects.get_or_create(pk=1)
        return HttpResponseRedirect(
            reverse('admin:content_contactcontent_change', args=[obj.pk])
        )


@admin.register(NotificationSettings)
class NotificationSettingsAdmin(admin.ModelAdmin):
    fieldsets = (
        ('Email-сповіщення', {
            'fields': (
                'email_enabled',
                'email_host',
                'email_port',
                'email_use_tls',
                'email_use_ssl',
                'email_host_user',
                'email_host_password',
                'admin_notification_email',
                'test_email_button',
            ),
        }),
        ('Viber-сповіщення', {
            'fields': (
                'viber_enabled',
                'viber_bot_token',
                'viber_admin_receiver',
            ),
        }),
    )
    readonly_fields = ('test_email_button',)
    save_on_top = True

    def test_email_button(self, obj):
        if obj and obj.pk:
            url = reverse('admin:content_notificationsettings_test_email', args=[obj.pk])
            return format_html(
                '<a class="button" href="{}" style="'
                'background:#417690;color:#fff;padding:6px 15px;border-radius:4px;'
                'text-decoration:none;display:inline-block;">'
                '✉ Протестувати пошту</a>'
                '<span style="margin-left:10px;color:#888;font-size:0.85em;">'
                'Надішле тестовий лист на Email адміністратора</span>',
                url
            )
        return '—'
    test_email_button.short_description = 'Тест з\'єднання'

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path(
                '<int:pk>/test-email/',
                self.admin_site.admin_view(self.test_email_view),
                name='content_notificationsettings_test_email',
            ),
        ]
        return custom_urls + urls

    def test_email_view(self, request, pk):
        obj = NotificationSettings.load()
        change_url = reverse('admin:content_notificationsettings_change', args=[obj.pk])
        recipient = obj.admin_notification_email or obj.email_host_user
        if not recipient:
            self.message_user(
                request,
                'Вкажіть Email адміністратора або логін відправника.',
                level=messages.ERROR,
            )
            return HttpResponseRedirect(change_url)
        try:
            import ssl
            from email.mime.text import MIMEText
            msg = MIMEText(
                'Це тестовий лист від Зеленого Куточка.\n'
                'Якщо ви отримали його — налаштування пошти вірні!',
                'plain', 'utf-8'
            )
            msg['Subject'] = 'Тестовий лист — Зелений Куточок'
            msg['From'] = obj.email_host_user
            msg['To'] = recipient
            context = ssl.create_default_context()
            use_ssl = getattr(obj, 'email_use_ssl', False)
            use_tls = getattr(obj, 'email_use_tls', True)
            if use_ssl:
                with smtplib.SMTP_SSL(obj.email_host, obj.email_port, context=context, timeout=10) as server:
                    server.login(obj.email_host_user, obj.email_host_password)
                    server.sendmail(obj.email_host_user, [recipient], msg.as_bytes())
            elif use_tls:
                with smtplib.SMTP(obj.email_host, obj.email_port, timeout=10) as server:
                    server.starttls(context=context)
                    server.login(obj.email_host_user, obj.email_host_password)
                    server.sendmail(obj.email_host_user, [recipient], msg.as_bytes())
            else:
                with smtplib.SMTP(obj.email_host, obj.email_port, timeout=10) as server:
                    server.login(obj.email_host_user, obj.email_host_password)
                    server.sendmail(obj.email_host_user, [recipient], msg.as_bytes())
            self.message_user(
                request,
                f'✅ Тестовий лист успішно надіслано на {recipient}.',
                level=messages.SUCCESS,
            )
        except smtplib.SMTPAuthenticationError:
            self.message_user(
                request,
                '❌ Помилка аутентифікації. Перевірте логін та пароль. '
                'Для Gmail потрібен App Password (не основний пароль).',
                level=messages.ERROR,
            )
        except smtplib.SMTPConnectError:
            self.message_user(
                request,
                f'❌ Не вдалося підключитися до {obj.email_host}:{obj.email_port}.',
                level=messages.ERROR,
            )
        except Exception as exc:
            self.message_user(
                request,
                f'❌ Помилка: {exc}',
                level=messages.ERROR,
            )
        return HttpResponseRedirect(change_url)

    def has_add_permission(self, request):
        return not NotificationSettings.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False

    def changelist_view(self, request, extra_context=None):
        obj, _ = NotificationSettings.objects.get_or_create(pk=1)
        return HttpResponseRedirect(
            reverse('admin:content_notificationsettings_change', args=[obj.pk])
        )


@admin.register(StaticPage)
class StaticPageAdmin(admin.ModelAdmin):
    list_display = ('title', 'slug', 'footer_link', 'is_active', 'updated_at', 'page_url')
    list_filter = ('is_active',)
    search_fields = ('title', 'slug')
    prepopulated_fields = {'slug': ('title',)}
    save_on_top = True
    fieldsets = (
        ('Основне', {
            'fields': ('title', 'slug', 'is_active', 'footer_link'),
        }),
        ('Вміст сторінки', {
            'fields': ('content',),
            'description': 'Підтримується HTML-розмітка.',
        }),
        ('SEO', {
            'fields': ('meta_description',),
            'classes': ('collapse',),
        }),
    )

    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj, **kwargs)
        form.base_fields['content'].widget.attrs.update({
            'rows': 25, 'style': 'font-family: monospace; width: 100%;'
        })
        return form

    def page_url(self, obj):
        return format_html(
            '<a href="/pages/{}" target="_blank">/pages/{}</a>', obj.slug, obj.slug
        )
    page_url.short_description = 'URL на сайті'


@admin.register(SiteReview)
class SiteReviewAdmin(admin.ModelAdmin):
    list_display = ('user', 'rating_stars', 'title_short', 'status_badge', 'created_at', 'actions_col')
    list_filter = ('status', 'rating')
    search_fields = ('user__username', 'user__first_name', 'user__last_name', 'title', 'comment')
    ordering = ('-created_at',)
    readonly_fields = ('user', 'rating', 'title', 'comment', 'created_at')
    save_on_top = True
    actions = ['approve_reviews', 'reject_reviews']
    fieldsets = (
        ('Відгук', {
            'fields': ('user', 'rating', 'title', 'comment', 'created_at'),
        }),
        ('Модерація', {
            'fields': ('status', 'admin_note'),
        }),
    )

    def rating_stars(self, obj):
        filled = '★' * obj.rating
        empty = '☆' * (5 - obj.rating)
        color = '#f59e0b' if obj.rating >= 4 else ('#fb923c' if obj.rating == 3 else '#ef4444')
        return format_html('<span style="color:{};font-size:1.1em;">{}</span><span style="color:#d1d5db;">{}</span>', color, filled, empty)
    rating_stars.short_description = 'Оцінка'

    def title_short(self, obj):
        text = obj.title or obj.comment[:60]
        return text[:60] + '…' if len(text) > 60 else text
    title_short.short_description = 'Відгук'

    def status_badge(self, obj):
        colors = {
            'pending':  ('#92400e', '#fef3c7'),
            'approved': ('#14532d', '#dcfce7'),
            'rejected': ('#7f1d1d', '#fee2e2'),
        }
        fg, bg = colors.get(obj.status, ('#374151', '#f3f4f6'))
        return format_html(
            '<span style="padding:2px 10px;border-radius:12px;font-size:.8em;'
            'font-weight:600;color:{};background:{};">{}</span>',
            fg, bg, obj.get_status_display(),
        )
    status_badge.short_description = 'Статус'

    def actions_col(self, obj):
        if obj.status == 'pending':
            approve_url = reverse('admin:content_sitereview_change', args=[obj.pk])
            return format_html('<a href="{}">✏️ Переглянути</a>', approve_url)
        return '—'
    actions_col.short_description = 'Дія'

    @admin.action(description='✅ Опублікувати вибрані відгуки')
    def approve_reviews(self, request, queryset):
        updated = queryset.update(status='approved')
        self.message_user(request, f'Опубліковано {updated} відгук(ів).')

    @admin.action(description='❌ Відхилити вибрані відгуки')
    def reject_reviews(self, request, queryset):
        updated = queryset.update(status='rejected')
        self.message_user(request, f'Відхилено {updated} відгук(ів).')


