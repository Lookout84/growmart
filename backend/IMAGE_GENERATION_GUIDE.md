# 🖼️ Автоматичний пошук та додавання зображень

## Огляд

Система автоматично знаходить та додає професійні фотографії товарів з різних джерел:

1. **Unsplash** - безкоштовний фотосток з мільйонами високоякісних зображень
2. **Pexels** - альтернативний безкоштовний фотосток
3. **DALL-E** - AI генерація унікальних зображень (OpenAI)

---

## Швидкий старт

### Варіант 1: Через адмін-панель (масово)

1. Відкрити http://localhost:8000/admin/products/product/
2. Вибрати товари без зображень (checkboxes)
3. В меню "Дії" вибрати:
   - **🖼️ Додати зображення (Unsplash/Pexels)** - пошук реальних фото
   - **🎨 Згенерувати зображення (DALL-E AI)** - генерація унікальних фото
4. Натиснути "Виконати"
5. ✨ Зображення додадуться автоматично!

### Варіант 2: Через API при створенні товару

```bash
curl -X POST http://localhost:8000/api/products/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Яблуня Голден Делішес",
    "category": 1,
    "price": 150.00,
    "stock": 50,
    "auto_add_images": true,
    "image_count": 3
  }'
```

### Варіант 3: Програмно (Python)

```python
from products.models import Product
from products.image_utils import add_images_to_product

product = Product.objects.get(id=1)

# Додати 3 зображення з Unsplash/Pexels
added_count = add_images_to_product(
    product=product,
    image_count=3,
    use_ai=True,
    use_dalle=False
)

print(f"Додано {added_count} зображень")
```

---

## Налаштування

### 1️⃣ Unsplash API (рекомендовано)

**Безкоштовний** для некомерційних та комерційних проектів.

1. Зареєструватися на https://unsplash.com/developers
2. Створити додаток (New Application)
3. Отримати Access Key
4. Додати в `docker-compose.yml`:

```yaml
backend:
  environment:
    - UNSPLASH_ACCESS_KEY=your-access-key-here
```

5. Перезапустити:
```bash
docker-compose restart backend
```

### 2️⃣ Pexels API (альтернатива)

**Безкоштовний** з необмеженою кількістю запитів.

1. Зареєструватися на https://www.pexels.com/api/
2. Отримати API Key
3. Додати в `docker-compose.yml`:

```yaml
backend:
  environment:
    - PEXELS_API_KEY=your-api-key-here
```

### 3️⃣ DALL-E (опціонально)

**Платний** (~$0.04 за зображення 1024x1024).

Використовує той самий `OPENAI_API_KEY` що і для генерації описів.

```yaml
backend:
  environment:
    - OPENAI_API_KEY=sk-your-api-key-here
```

---

## Як це працює

### Пошук через Unsplash/Pexels

1. Система формує пошуковий запит з назви товару
2. Перекладає українські терміни на англійські
3. Додає ключові слова: "plant", "nursery", "garden"
4. Відправляє запит до Unsplash API
5. Якщо немає результатів - пробує Pexels
6. Завантажує знайдені зображення
7. Оптимізує (змінює розмір, конвертує в JPEG)
8. Зберігає як ProductImage

**Приклад пошукового запиту:**
- Назва: "Яблуня Голден Делішес"
- Запит: "apple tree golden delicious plant nursery garden"

### Генерація через DALL-E

1. Формує промпт для AI: "Professional product photo of [product], high quality, natural lighting, garden nursery setting"
2. Відправляє запит до DALL-E 3
3. Отримує згенероване зображення
4. Завантажує та зберігає

---

## Параметри API

### При створенні товару

```json
{
  "name": "Яблуня Голден Делішес",
  "category": 1,
  "price": 150.00,
  "stock": 50,
  
  // Параметри зображень
  "auto_add_images": true,      // Автоматично додати зображення
  "image_count": 3,             // Кількість зображень (1-10)
  "use_dalle": false            // Генерувати через DALL-E
}
```

### Що відбувається:

- `auto_add_images: true` - шукає та додає зображення
- `auto_add_images: false` - не додає зображення (за замовчуванням)
- `image_count: 3` - кількість зображень для пошуку (максимум 10)
- `use_dalle: true` - генерує через DALL-E замість пошуку
- `use_dalle: false` - шукає на Unsplash/Pexels (за замовчуванням)

---

## Приклади використання

### 1. Створення товару з 3 фото з Unsplash

```bash
curl -X POST http://localhost:8000/api/products/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Груша Конференція",
    "category": 1,
    "price": 200.00,
    "stock": 30,
    "auto_add_images": true,
    "image_count": 3
  }'
```

### 2. Створення товару з AI-згенерованим зображенням

```bash
curl -X POST http://localhost:8000/api/products/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Вишня Шпанка",
    "category": 2,
    "price": 180.00,
    "stock": 40,
    "auto_add_images": true,
    "image_count": 1,
    "use_dalle": true
  }'
```

### 3. Python приклад

```python
import requests

# Авторизація
response = requests.post('http://localhost:8000/api/users/login/', json={
    'username': 'admin',
    'password': 'admin123'
})
token = response.json()['access']

# Створення товару з зображеннями
product_data = {
    'name': 'Яблуня Голден Делішес',
    'category': 1,
    'price': 150.00,
    'stock': 50,
    'auto_add_images': True,
    'image_count': 5,
    'use_dalle': False
}

response = requests.post(
    'http://localhost:8000/api/products/',
    json=product_data,
    headers={'Authorization': f'Bearer {token}'}
)

product = response.json()
print(f"Товар створено: {product['name']}")
print(f"Зображень: {len(product.get('images', []))}")
```

---

## Оптимізація зображень

Система автоматично оптимізує всі зображення:

- ✅ Конвертація в JPEG (зменшення розміру)
- ✅ Зміна розміру до максимум 1920x1920px
- ✅ Compression з якістю 85%
- ✅ Видалення EXIF метаданих
- ✅ Конвертація RGBA → RGB

**Розмір файлів:** зазвичай 100-300 KB замість 2-5 MB оригіналу

---

## Обмеження

### Unsplash API
- **Безкоштовно:** 50 запитів/годину (Demo)
- **Production:** 5000 запитів/годину
- **Максимум:** 10 зображень за запит

### Pexels API
- **Безкоштовно:** Необмежено запитів
- **Rate limit:** 200 запитів/годину
- **Максимум:** 15 зображень за запит

### DALL-E API
- **Вартість:** ~$0.04 за зображення 1024x1024
- **Якість standard:** швидше та дешевше
- **Якість hd:** краща якість, дорожче ($0.08)
- **Ліміт:** залежить від вашого OpenAI плану

---

## Troubleshooting

### ❌ Не знаходить зображення

**Причини:**
- API ключ не налаштовано
- Назва товару занадто специфічна
- Немає результатів для запиту

**Рішення:**
- Налаштуйте Unsplash або Pexels API ключ
- Спробуйте більш загальну назву
- Використайте DALL-E для генерації

### ❌ Помилка завантаження зображення

**Причини:**
- Проблеми з мережею
- Timeout при завантаженні
- Недостатньо місця на диску

**Рішення:**
- Перевірте інтернет-з'єднання
- Збільшіть timeout (за замовчуванням 30 сек)
- Очистіть старі зображення

### ❌ DALL-E повертає помилку

**Причини:**
- Недостатньо коштів на балансі OpenAI
- Rate limit перевищено
- Промпт порушує правила контенту

**Рішення:**
- Поповніть баланс на https://platform.openai.com/
- Зачекайте перед наступним запитом
- Використайте Unsplash замість DALL-E

---

## Логування

Перевірити логи пошуку зображень:

```bash
docker-compose logs backend | grep "зображень"
```

**Типові повідомлення:**
- `Знайдено 3 зображень для 'apple tree' на Unsplash` - успіх
- `UNSPLASH_ACCESS_KEY не налаштовано` - потрібен API ключ
- `Додано зображення #1 для товару 'Яблуня'` - зображення збережено
- `Помилка при завантаженні зображення` - проблема з мережею

---

## Вартість

### Безкоштовні опції:
- ✅ Unsplash (50 запитів/год демо, 5000 production)
- ✅ Pexels (необмежено)

### Платні опції:
- 💰 DALL-E Standard: $0.04 за зображення
- 💰 DALL-E HD: $0.08 за зображення

**Рекомендація:** Використовуйте Unsplash/Pexels для більшості товарів, DALL-E тільки для унікальних випадків.

---

## FAQ

**Q: Які джерела найкращі для саджанців?**  
A: Unsplash має найбільше якісних фото рослин та садівництва

**Q: Чи можна використовувати зображення комерційно?**  
A: Так, Unsplash та Pexels дозволяють комерційне використання без атрибуції

**Q: Скільки часу займає пошук зображень?**  
A: 2-5 секунд на товар (пошук + завантаження + оптимізація)

**Q: Чи зберігаються авторські дані?**  
A: Так, в полі `alt_text` зберігається автор та опис

**Q: Як видалити автоматично додані зображення?**  
A: Через адмін-панель Products → [Товар] → Images (inline редагування)

---

## Технічні деталі

### Файли проекту:
- `products/image_utils.py` - логіка пошуку та завантаження
- `products/serializers.py` - інтеграція в API
- `products/admin.py` - admin actions

### Формат збереження:
- **Формат:** JPEG
- **Якість:** 85%
- **Макс розмір:** 1920x1920px
- **Назва файлу:** `product_[hash].jpg`

### API ендпоінти:
- Unsplash: `https://api.unsplash.com/search/photos`
- Pexels: `https://api.pexels.com/v1/search`
- DALL-E: `https://api.openai.com/v1/images/generations`

---

**Готово!** 🎉 Автоматичний пошук зображень працює!
