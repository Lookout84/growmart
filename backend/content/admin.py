from django.contrib import admin
from django.http import HttpResponseRedirect
from django.urls import reverse
from .models import FooterSettings, FooterSection, FooterLink, FooterSocialLink, AboutContent, ContactContent, NotificationSettings


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
    list_display = ('label', 'section', 'url', 'order', 'is_active')
    list_editable = ('order', 'is_active')
    list_filter = ('section',)
    ordering = ('section', 'order')
    fields = ('section', 'label', 'url', 'description', 'order', 'is_active')


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
                'email_host_user',
                'email_host_password',
                'admin_notification_email',
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
    save_on_top = True

    def has_add_permission(self, request):
        return not NotificationSettings.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False

    def changelist_view(self, request, extra_context=None):
        obj, _ = NotificationSettings.objects.get_or_create(pk=1)
        return HttpResponseRedirect(
            reverse('admin:content_notificationsettings_change', args=[obj.pk])
        )
