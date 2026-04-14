# 🎉 Автоматична генерація описів та артикулів товарів

## Що було додано

### ✅ Автоматична генерація артикулів (SKU)
Товари автоматично отримують унікальний артикул формату `SKU-XXXXXXXX` при створенні, якщо його не вказано вручну.

### ✅ Автоматична генерація описів
Описи товарів генеруються автоматично на основі назви та категорії. Підтримується:
- **AI генерація** через OpenAI GPT-4 (опціонально)
- **Шаблонна генерація** (працює без налаштувань)

### ✅ Підтримка через API та адмін-панель
Функціональність доступна як через REST API, так і через Django адмін-панель.

---

## Структура файлів

```
backend/
├── products/
│   ├── utils.py                          # Утиліти для генерації описів
│   ├── serializers.py                     # ProductCreateSerializer
│   ├── views.py                           # ProductViewSet (CRUD)
│   ├── admin.py                           # Admin actions
│   └── models.py                          # Оновлена модель Product
├── requirements.txt                       # +openai==1.12.0
├── QUICK_START_AUTO_DESCRIPTION.md       # 🚀 Швидкий старт
├── AUTO_DESCRIPTION_GUIDE.md             # 📚 Детальна документація
└── API_EXAMPLES.md                       # 🔧 Приклади API запитів
```

---

## Швидкий старт

### 1️⃣ Через адмін-панель (найпростіше)

```
1. Відкрити http://localhost:8000/admin/products/product/add/
2. Заповнити назву, категорію, ціну, залишок
3. Залишити опис порожнім
4. Зберегти
5. ✨ Опис згенерується автоматично!
```

### 2️⃣ Через API

```bash
curl -X POST http://localhost:8000/api/products/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Яблуня Голден Делішес",
    "category": 1,
    "price": 150.00,
    "stock": 50
  }'
```

### 3️⃣ Масова генерація для існуючих товарів

```
1. Відкрити список товарів в адмін-панелі
2. Вибрати товари (checkboxes)
3. Дія: "📝 Згенерувати описи (Шаблон)"
4. Виконати
5. ✨ Описи згенеруються для всіх!
```

---

## Що генерується автоматично

| Поле | Формат | Приклад |
|------|--------|---------|
| **Артикул (SKU)** | `SKU-XXXXXXXX` | `SKU-A5B9C2D1` |
| **URL (slug)** | slugify(name) | `yablunia-golden-delishes` |
| **Опис** | 150-250 слів | Детальний опис товару... |
| **Короткий опис** | 1-2 речення | Короткий опис товару... |

---

## Налаштування AI генерації (опціонально)

> ⚠️ За замовчуванням працює **шаблонна генерація** (не потребує налаштувань)

Для AI генерації додайте API ключ OpenAI в `docker-compose.yml`:

```yaml
backend:
  environment:
    - OPENAI_API_KEY=sk-your-api-key-here
```

Перезапустіть контейнери:
```bash
docker-compose restart backend
```

---

## Приклад результату

**Вхідні дані:**
- Назва: `Яблуня Голден Делішес`
- Категорія: `Плодові дерева`
- Ціна: `150 грн`
- Залишок: `50 шт`

**Автоматично згенеровано:**

```yaml
SKU: SKU-A5B9C2D1
Slug: yablunia-golden-delishes

Короткий опис:
  "Яблуня Голден Делішес - якісний саджанець для вашого саду. 
   Висока приживлюваність, розвинена коренева система."

Повний опис:
  "Яблуня Голден Делішес з категорії Плодові дерева - якісний саджанець 
   для вашого саду.
   
   Цей товар відзначається високою якістю та відмінними характеристиками. 
   Саджанець вирощений з дотриманням всіх агротехнічних норм, що гарантує 
   його приживлюваність та швидкий ріст.
   
   Основні переваги:
   • Висока якість посадкового матеріалу
   • Розвинена коренева система
   • Гарантія приживлюваності
   • Рекомендації щодо посадки та догляду
   
   Ідеально підходить як для приватних садів, так і для комерційного 
   вирощування. Саджанець постачається з детальними інструкціями по 
   посадці та догляду."
```

---

## Технічні деталі

### Залежності
- `openai==1.12.0` - для AI генерації
- `python-decouple` - для конфігурації

### API ендпоінти
- `POST /api/products/` - створення товару
- `GET /api/products/` - список товарів
- `GET /api/products/{slug}/` - деталі товару
- `PATCH /api/products/{id}/` - оновлення товару
- `DELETE /api/products/{id}/` - видалення товару

### Міграції
Створено міграцію для поля `sku`:
```
products/migrations/0004_alter_product_sku.py
```

---

## Документація

📖 **Детальні гайди:**
- [QUICK_START_AUTO_DESCRIPTION.md](QUICK_START_AUTO_DESCRIPTION.md) - Швидкий старт
- [AUTO_DESCRIPTION_GUIDE.md](AUTO_DESCRIPTION_GUIDE.md) - Повна документація
- [API_EXAMPLES.md](API_EXAMPLES.md) - Приклади API запитів

---

## Тестування

### Локальне тестування

```bash
# Створення тестового товару
docker-compose exec backend python manage.py shell -c "
from products.models import Product, Category
from products.serializers import ProductCreateSerializer

cat = Category.objects.first()
data = {
    'name': 'Тестовий саджанець',
    'category': cat.id,
    'price': 100,
    'stock': 10
}

serializer = ProductCreateSerializer(data=data)
if serializer.is_valid():
    product = serializer.save()
    print(f'Створено: {product.name}')
    print(f'SKU: {product.sku}')
    print(f'Опис: {product.description[:100]}...')
"
```

### Через API (curl)

```bash
# 1. Отримати токен
TOKEN=$(curl -X POST http://localhost:8000/api/users/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}' \
  | jq -r '.access')

# 2. Створити товар
curl -X POST http://localhost:8000/api/products/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Яблуня тестова",
    "category": 1,
    "price": 150,
    "stock": 50
  }' | jq
```

---

## Можливі помилки та рішення

### ❌ `OPENAI_API_KEY не знайдено`
**Рішення:** Це попередження, не помилка. Використовується шаблонна генерація.

### ❌ `401 Unauthorized`
**Рішення:** Додайте Authorization header з токеном адміністратора.

### ❌ `Поле slug обов'язкове`
**Рішення:** Оновлено в серіалізаторі, slug генерується автоматично.

### ❌ `Rate limit exceeded` (OpenAI)
**Рішення:** Використайте шаблонну генерацію або зачекайте.

---

## Що далі?

### Можливі покращення:
- [ ] Додати вибір мови генерації (українська/російська/англійська)
- [ ] Кешування згенерованих описів
- [ ] Черга для масової генерації (Celery task)
- [ ] Інтеграція з іншими AI моделями (Claude, Gemini)
- [ ] A/B тестування різних варіантів описів
- [ ] Генерація SEO мета-тегів

---

## Автор
Створено для GrowMart - інтернет-магазин саджанців рослин

## Ліцензія
MIT License - використовуйте вільно! 🚀
