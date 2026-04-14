from rest_framework import serializers
from .models import FooterSettings, FooterSection, FooterLink, FooterSocialLink


class FooterLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = FooterLink
        fields = ('id', 'label', 'url', 'description', 'order')


class FooterSectionSerializer(serializers.ModelSerializer):
    links = FooterLinkSerializer(many=True, source='links.filter')

    class Meta:
        model = FooterSection
        fields = ('id', 'title', 'description', 'order', 'links')

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        ret['links'] = FooterLinkSerializer(
            instance.links.filter(is_active=True), many=True
        ).data
        return ret


class FooterSocialLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = FooterSocialLink
        fields = ('id', 'name', 'icon', 'url', 'order')


class FooterSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = FooterSettings
        fields = ('company_name', 'copyright_text', 'phone', 'email',
                  'address', 'facebook_url', 'instagram_url', 'telegram_url')


from .models import AboutContent, ContactContent


class AboutContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = AboutContent
        fields = (
            'history_title', 'history_text_1', 'history_text_2',
            'stat1_icon', 'stat1_number', 'stat1_label',
            'stat2_icon', 'stat2_number', 'stat2_label',
            'stat3_icon', 'stat3_number', 'stat3_label',
            'stat4_icon', 'stat4_number', 'stat4_label',
            'cta_title', 'cta_text',
        )


class ContactContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactContent
        fields = (
            'hero_subtitle',
            'phone1', 'phone1_href', 'phone2', 'phone2_href',
            'email', 'address',
            'hours_weekday_label', 'hours_weekday',
            'hours_saturday_label', 'hours_saturday',
            'hours_sunday_label', 'hours_sunday',
            'form_subtitle',
        )
