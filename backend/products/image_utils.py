"""
Утиліти для роботи з зображеннями товарів
"""
import os
import requests
from io import BytesIO
from django.core.files.base import ContentFile
from django.core.files.uploadedfile import InMemoryUploadedFile
from decouple import config
from openai import OpenAI
import logging
from PIL import Image
import hashlib
from urllib.parse import urlparse

logger = logging.getLogger(__name__)


def search_unsplash_images(query, count=3):
    """
    Пошук зображень через Unsplash API
    
    Args:
        query (str): Пошуковий запит
        count (int): Кількість зображень (макс 10)
    
    Returns:
        list: Список URL зображень
    """
    access_key = config('UNSPLASH_ACCESS_KEY', default=None)
    
    if not access_key:
        logger.warning("UNSPLASH_ACCESS_KEY не налаштовано")
        return []
    
    try:
        # Формуємо запит до Unsplash API
        url = "https://api.unsplash.com/search/photos"
        params = {
            'query': query,
            'per_page': min(count, 10),
            'orientation': 'landscape',
            'content_filter': 'high'
        }
        headers = {
            'Authorization': f'Client-ID {access_key}'
        }
        
        response = requests.get(url, params=params, headers=headers, timeout=10)
        response.raise_for_status()
        
        data = response.json()
        results = data.get('results', [])
        
        # Повертаємо URL зображень (regular розмір - оптимальний для веб)
        image_urls = [
            {
                'url': item['urls']['regular'],
                'download_url': item['urls']['full'],
                'author': item['user']['name'],
                'author_url': item['user']['links']['html'],
                'description': item.get('description') or item.get('alt_description', ''),
            }
            for item in results
        ]
        
        logger.info(f"Знайдено {len(image_urls)} зображень для '{query}' на Unsplash")
        return image_urls
        
    except Exception as e:
        logger.error(f"Помилка при пошуку зображень на Unsplash: {str(e)}")
        return []


def search_pexels_images(query, count=3):
    """
    Пошук зображень через Pexels API (альтернатива Unsplash)
    
    Args:
        query (str): Пошуковий запит
        count (int): Кількість зображень
    
    Returns:
        list: Список URL зображень
    """
    api_key = config('PEXELS_API_KEY', default=None)
    
    if not api_key:
        logger.warning("PEXELS_API_KEY не налаштовано")
        return []
    
    try:
        url = "https://api.pexels.com/v1/search"
        params = {
            'query': query,
            'per_page': min(count, 15),
            'orientation': 'landscape'
        }
        headers = {
            'Authorization': api_key
        }
        
        response = requests.get(url, params=params, headers=headers, timeout=10)
        response.raise_for_status()
        
        data = response.json()
        photos = data.get('photos', [])
        
        image_urls = [
            {
                'url': photo['src']['large'],
                'download_url': photo['src']['original'],
                'author': photo['photographer'],
                'author_url': photo['photographer_url'],
                'description': f"Photo by {photo['photographer']}",
            }
            for photo in photos
        ]
        
        logger.info(f"Знайдено {len(image_urls)} зображень для '{query}' на Pexels")
        return image_urls
        
    except Exception as e:
        logger.error(f"Помилка при пошуку зображень на Pexels: {str(e)}")
        return []


def generate_image_dalle(prompt, size="1024x1024", quality="standard"):
    """
    Генерація зображення через DALL-E (OpenAI)
    
    Args:
        prompt (str): Опис зображення
        size (str): Розмір (1024x1024, 1792x1024, 1024x1792)
        quality (str): Якість (standard, hd)
    
    Returns:
        str: URL згенерованого зображення або None
    """
    api_key = config('OPENAI_API_KEY', default=None)
    
    if not api_key:
        logger.warning("OPENAI_API_KEY не налаштовано для DALL-E")
        return None
    
    try:
        client = OpenAI(api_key=api_key)
        
        # Генеруємо промпт для зображення саджанця
        enhanced_prompt = f"Professional product photo of {prompt}, high quality, natural lighting, garden nursery setting, botanical photography style"
        
        response = client.images.generate(
            model="dall-e-3",
            prompt=enhanced_prompt,
            size=size,
            quality=quality,
            n=1,
        )
        
        image_url = response.data[0].url
        logger.info(f"Згенеровано зображення через DALL-E для '{prompt}'")
        
        return {
            'url': image_url,
            'download_url': image_url,
            'author': 'AI Generated (DALL-E)',
            'author_url': '',
            'description': f"AI generated image: {prompt}",
        }
        
    except Exception as e:
        logger.error(f"Помилка при генерації зображення DALL-E: {str(e)}")
        return None


def download_image_from_url(image_url, timeout=30):
    """
    Завантажує зображення з URL
    
    Args:
        image_url (str): URL зображення
        timeout (int): Таймаут запиту
    
    Returns:
        ContentFile: Файл зображення або None
    """
    try:
        response = requests.get(image_url, timeout=timeout, stream=True)
        response.raise_for_status()
        
        # Перевіряємо що це дійсно зображення
        content_type = response.headers.get('content-type', '')
        if not content_type.startswith('image/'):
            logger.error(f"URL не є зображенням: {content_type}")
            return None
        
        # Читаємо зображення
        image_content = BytesIO()
        for chunk in response.iter_content(chunk_size=8192):
            image_content.write(chunk)
        
        image_content.seek(0)
        
        # Оптимізуємо зображення через PIL
        img = Image.open(image_content)
        
        # Конвертуємо в RGB якщо потрібно
        if img.mode in ('RGBA', 'LA', 'P'):
            background = Image.new('RGB', img.size, (255, 255, 255))
            if img.mode == 'P':
                img = img.convert('RGBA')
            background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
            img = background
        
        # Змінюємо розмір якщо занадто великий
        max_size = (1920, 1920)
        if img.size[0] > max_size[0] or img.size[1] > max_size[1]:
            img.thumbnail(max_size, Image.Resampling.LANCZOS)
            logger.info(f"Зображення зменшено до {img.size}")
        
        # Зберігаємо в BytesIO
        output = BytesIO()
        img.save(output, format='JPEG', quality=85, optimize=True)
        output.seek(0)
        
        # Генеруємо унікальне ім'я файлу
        url_hash = hashlib.md5(image_url.encode()).hexdigest()[:10]
        filename = f"product_{url_hash}.jpg"
        
        return ContentFile(output.read(), name=filename)
        
    except Exception as e:
        logger.error(f"Помилка при завантаженні зображення з {image_url}: {str(e)}")
        return None


def add_images_to_product(product, image_count=3, use_ai=False, use_dalle=False):
    """
    Додає зображення до товару автоматично
    
    Args:
        product: Об'єкт Product
        image_count (int): Кількість зображень для пошуку
        use_ai (bool): Використовувати AI пошук (Unsplash/Pexels)
        use_dalle (bool): Генерувати зображення через DALL-E
    
    Returns:
        int: Кількість доданих зображень
    """
    from .models import ProductImage
    
    added_count = 0
    
    # Формуємо пошуковий запит
    search_query = f"{product.name}"
    if product.category:
        search_query += f" {product.category.name}"
    
    # Додаємо ключові слова для кращого пошуку
    search_query += " plant seedling nursery"
    
    images_data = []
    
    # Спроба 1: DALL-E генерація (якщо увімкнено)
    if use_dalle and not images_data:
        dalle_image = generate_image_dalle(product.name)
        if dalle_image:
            images_data.append(dalle_image)
    
    # Спроба 2: Unsplash пошук
    if use_ai and len(images_data) < image_count:
        unsplash_images = search_unsplash_images(search_query, image_count)
        images_data.extend(unsplash_images)
    
    # Спроба 3: Pexels пошук (якщо Unsplash не дав результатів)
    if use_ai and len(images_data) < image_count:
        pexels_images = search_pexels_images(search_query, image_count)
        images_data.extend(pexels_images)
    
    # Завантажуємо та зберігаємо зображення
    for idx, image_info in enumerate(images_data[:image_count]):
        try:
            image_url = image_info.get('download_url') or image_info.get('url')
            image_file = download_image_from_url(image_url)
            
            if image_file:
                # Створюємо ProductImage
                product_image = ProductImage.objects.create(
                    product=product,
                    image=image_file,
                    alt_text=image_info.get('description', product.name),
                    is_primary=(idx == 0 and not product.images.exists()),
                    order=idx
                )
                
                logger.info(f"Додано зображення #{idx + 1} для товару '{product.name}'")
                added_count += 1
                
        except Exception as e:
            logger.error(f"Не вдалося додати зображення #{idx + 1}: {str(e)}")
            continue
    
    if added_count > 0:
        logger.info(f"Всього додано {added_count} зображень для товару '{product.name}'")
    else:
        logger.warning(f"Не вдалося додати жодного зображення для товару '{product.name}'")
    
    return added_count


def get_product_search_query(product_name, category_name=None, language='en'):
    """
    Формує оптимальний пошуковий запит для зображень товару
    
    Args:
        product_name (str): Назва товару українською
        category_name (str): Назва категорії
        language (str): Мова пошуку
    
    Returns:
        str: Пошуковий запит
    """
    # Базові терміни для перекладу
    plant_terms = {
        'яблуня': 'apple tree',
        'груша': 'pear tree',
        'вишня': 'cherry tree',
        'слива': 'plum tree',
        'персик': 'peach tree',
        'абрикос': 'apricot tree',
        'черешня': 'sweet cherry',
        'малина': 'raspberry',
        'полуниця': 'strawberry',
        'смородина': 'currant',
        'виноград': 'grape',
        'троянда': 'rose',
        'саджанець': 'seedling plant',
        'дерево': 'tree',
        'кущ': 'shrub bush',
    }
    
    query = product_name.lower()
    
    # Намагаємось перекласти ключові слова
    for ukr, eng in plant_terms.items():
        if ukr in query:
            query = query.replace(ukr, eng)
    
    # Додаємо специфічні терміни для кращого пошуку
    query += " plant nursery garden"
    
    return query
