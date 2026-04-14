"""
Утиліти для роботи з товарами
"""
import os
from openai import OpenAI
from decouple import config
import logging

logger = logging.getLogger(__name__)


def generate_product_description(product_name, category_name=None, use_ai=True):
    """
    Генерує опис товару на основі назви
    
    Args:
        product_name (str): Назва товару
        category_name (str): Назва категорії (опціонально)
        use_ai (bool): Використовувати AI для генерації (True) або шаблонний опис (False)
    
    Returns:
        tuple: (description, short_description)
    """
    
    if use_ai:
        try:
            # Перевіряємо наявність API ключа
            api_key = config('OPENAI_API_KEY', default=None)
            if not api_key:
                logger.warning("OPENAI_API_KEY не знайдено, використовується шаблонний опис")
                return generate_template_description(product_name, category_name)
            
            # Ініціалізуємо OpenAI клієнт
            client = OpenAI(api_key=api_key)
            
            # Формуємо промпт
            category_info = f" з категорії '{category_name}'" if category_name else ""
            prompt = f"""Створи професійний опис для товару '{product_name}'{category_info} для інтернет-магазину саджанців рослин.

Опис повинен бути:
- Інформативним та привабливим для покупців
- Розміром 150-250 слів
- Написаний українською мовою
- Включати основні характеристики рослини (якщо можна визначити з назви)
- Містити рекомендації по догляду
- Описувати переваги вирощування

Формат відповіді:
ПОВНИЙ_ОПИС: [детальний опис товару]
КОРОТКИЙ_ОПИС: [короткий опис до 100 символів]"""

            # Викликаємо API
            response = client.chat.completions.create(
                model="gpt-4o-mini",  # Використовуємо більш доступну модель
                messages=[
                    {"role": "system", "content": "Ти - професійний копірайтер для інтернет-магазину рослин та саджанців. Твоя задача - створювати привабливі та інформативні описи товарів українською мовою."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=600,
                temperature=0.7
            )
            
            # Парсимо відповідь
            content = response.choices[0].message.content.strip()
            
            # Витягуємо опис та короткий опис
            description = ""
            short_description = ""
            
            lines = content.split('\n')
            for i, line in enumerate(lines):
                if line.startswith('ПОВНИЙ_ОПИС:'):
                    description = line.replace('ПОВНИЙ_ОПИС:', '').strip()
                    # Якщо опис на наступних рядках
                    if not description and i + 1 < len(lines):
                        description = '\n'.join(lines[i+1:]).split('КОРОТКИЙ_ОПИС:')[0].strip()
                elif line.startswith('КОРОТКИЙ_ОПИС:'):
                    short_description = line.replace('КОРОТКИЙ_ОПИС:', '').strip()
                    # Якщо опис на наступному рядку
                    if not short_description and i + 1 < len(lines):
                        short_description = lines[i+1].strip()
            
            # Fallback якщо парсинг не вдався
            if not description:
                parts = content.split('КОРОТКИЙ_ОПИС:')
                description = parts[0].replace('ПОВНИЙ_ОПИС:', '').strip()
                if len(parts) > 1:
                    short_description = parts[1].strip()
            
            # Обрізаємо короткий опис до 500 символів
            if short_description:
                short_description = short_description[:500]
            else:
                # Створюємо короткий опис з першого речення
                sentences = description.split('.')
                short_description = sentences[0][:500] if sentences else description[:500]
            
            logger.info(f"Згенеровано AI опис для товару: {product_name}")
            return description, short_description
            
        except Exception as e:
            logger.error(f"Помилка при генерації AI опису: {str(e)}")
            # У разі помилки використовуємо шаблонний опис
            return generate_template_description(product_name, category_name)
    else:
        return generate_template_description(product_name, category_name)


def generate_template_description(product_name, category_name=None):
    """
    Генерує шаблонний опис товару
    
    Args:
        product_name (str): Назва товару
        category_name (str): Назва категорії (опціонально)
    
    Returns:
        tuple: (description, short_description)
    """
    category_text = f" з категорії {category_name}" if category_name else ""
    
    description = f"""
{product_name}{category_text} - якісний саджанець для вашого саду.

Цей товар відзначається високою якістю та відмінними характеристиками. Саджанець вирощений з дотриманням всіх агротехнічних норм, що гарантує його приживлюваність та швидкий ріст.

Основні переваги:
• Висока якість посадкового матеріалу
• Розвинена коренева система
• Гарантія приживлюваності
• Рекомендації щодо посадки та догляду

Ідеально підходить як для приватних садів, так і для комерційного вирощування. Саджанець постачається з детальними інструкціями по посадці та догляду.

При дотриманні рекомендацій щодо догляду, ви отримаєте здорову та продуктивну рослину, яка буде радувати вас довгі роки.
    """.strip()
    
    short_description = f"{product_name} - якісний саджанець для вашого саду. Висока приживлюваність, розвинена коренева система."
    
    return description, short_description
