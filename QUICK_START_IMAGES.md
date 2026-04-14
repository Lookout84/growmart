# 🚀 Швидкий старт: Автоматичне додавання зображень

## Крок 1: Налаштування API ключів

### Отримання безкоштовних ключів

1. **Unsplash API** (рекомендовано для початку):
   - Зареєструйтесь на https://unsplash.com/developers
   - Створіть новий додаток
   - Скопіюйте **Access Key**
   - Ліміт: 50 запитів/годину (демо режим)

2. **Pexels API** (необов'язково, але рекомендовано як резерв):
   - Зареєструйтесь на https://www.pexels.com/api/
   - Скопіюйте **API Key**
   - Ліміт: Необмежений запитів (безкоштовно)

3. **OpenAI API** (необов'язково, платно):
   - Зареєструйтесь на https://platform.openai.com/
   - Додайте баланс ($5 мінімум)
   - Створіть **API Key**
   - Ціна: ~$0.04 за зображення (DALL-E 3)

### Додавання ключів в проект

Відредагуйте `docker-compose.yml`:

```yaml
services:
  backend:
    environment:
      # Існуючі змінні...
      - OPENAI_API_KEY=sk-proj-xxxxx              # Для опису + DALL-E
      - UNSPLASH_ACCESS_KEY=xxxxx                 # Для Unsplash
      - PEXELS_API_KEY=xxxxx                      # Для Pexels
```

Перезапустіть backend:

```bash
docker-compose restart backend
```

---

## Крок 2: Тестування через адмін-панель

### Створення товару з автоматичними зображеннями

1. Відкрийте http://localhost:8000/admin/
2. Увійдіть (admin/admin123)
3. Перейдіть в **Products → Products → Add Product**
4. Заповніть обов'язкові поля:
   - **Name**: `Груша Конференція`
   - **Category**: Виберіть категорію
   - **Price**: `200.00`
   - **Stock**: `50`
5. ✅ Залиште **Auto generate description** увімкненим
6. ✅ Увімкніть **Auto add images**
7. Встановіть **Image count**: `3`
8. Натисніть **Save**
9. ✨ Автоматично згенеруються:
   - SKU (наприклад, `SKU-X7J3Q2R9`)
   - Опис товару
   - 3 зображення з Unsplash/Pexels

### Масове додавання зображень до існуючих товарів

1. Перейдіть в **Products → Products**
2. Виберіть товари (checkboxes)
3. Виберіть дію:
   - **"🖼️ Додати зображення (Unsplash/Pexels)"** - додає 3 фото
   - **"🎨 Згенерувати зображення (DALL-E AI)"** - генерує 1 DALL-E фото
4. Натисніть **Go**
5. Дочекайтесь повідомлення про успіх

---

## Крок 3: Тестування через API

### POST запит з автоматичними зображеннями

```bash
# Отримання токена
curl -X POST http://localhost:8000/api/users/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'

# Створення товару
curl -X POST http://localhost:8000/api/products/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "name": "Яблуня Голден Делішес",
    "category": 1,
    "price": 150.00,
    "stock": 50,
    "auto_add_images": true,
    "image_count": 5
  }'
```

### Відповідь

```json
{
  "id": 15,
  "name": "Яблуня Голден Делішес",
  "sku": "SKU-A5B9C2D1",
  "slug": "yablunia-golden-delishes",
  "description": "Високоякісний саджанець яблуні сорту Голден Делішес...",
  "short_description": "Преміум саджанці яблуні для вашого саду",
  "price": "150.00",
  "images": [
    {
      "id": 1,
      "image": "/media/products/golden_delicious_apple_tree_abc123.jpg",
      "is_primary": true
    },
    {
      "id": 2,
      "image": "/media/products/golden_delicious_apple_tree_def456.jpg",
      "is_primary": false
    }
    // ... ще 3 зображення
  ]
}
```

---

## Крок 4: Перевірка результатів

### Через адмін-панель

1. Відкрийте створений товар
2. Прокрутіть до секції **Product images**
3. Переконайтесь, що зображення додані
4. Натисніть на зображення для перегляду

### Через файлову систему

```bash
# Перевірка завантажених зображень
docker-compose exec backend ls -lh media/products/

# Приклад виводу:
# -rw-r--r-- 1 root root 245K Mar 29 12:34 golden_delicious_abc123.jpg
# -rw-r--r-- 1 root root 189K Mar 29 12:34 golden_delicious_def456.jpg
```

### Через API

```bash
# Отримання товару з зображеннями
curl http://localhost:8000/api/products/15/
```

---

## ⚙️ Параметри налаштування

### ProductCreateSerializer

| Параметр | Тип | За замовчуванням | Опис |
|----------|-----|------------------|------|
| `auto_generate_description` | boolean | `true` | Генерувати опис автоматично |
| `auto_add_images` | boolean | `false` | Додавати зображення автоматично |
| `image_count` | integer | `3` | Кількість зображень (1-10) |
| `use_dalle` | boolean | `false` | Використати DALL-E (платно) |

### Приклади використання

**Тільки опис (без зображень):**
```json
{
  "name": "Вишня Чорна",
  "category": 1,
  "price": 120.00,
  "auto_generate_description": true,
  "auto_add_images": false
}
```

**Опис + 5 безкоштовних зображень:**
```json
{
  "name": "Вишня Чорна",
  "category": 1,
  "price": 120.00,
  "auto_add_images": true,
  "image_count": 5
}
```

**Опис + 1 DALL-E зображення:**
```json
{
  "name": "Вишня Чорна",
  "category": 1,
  "price": 120.00,
  "auto_add_images": true,
  "image_count": 1,
  "use_dalle": true
}
```

---

## 🔍 Усунення проблем

### Зображення не додаються

1. **Перевірте API ключі** в `docker-compose.yml`
2. **Перезапустіть backend**: `docker-compose restart backend`
3. **Перевірте логи**:
   ```bash
   docker-compose logs backend | grep -i "image\|error"
   ```

### Помилка "API key not configured"

Додайте відповідний ключ в `docker-compose.yml`:
```yaml
- UNSPLASH_ACCESS_KEY=your_key_here
```

### Зображення поганої якості

- Для Unsplash/Pexels: автоматично обираються високоякісні фото
- Для DALL-E: оптимізуйте промпт в коді (див. `image_utils.py`)

### Повільне завантаження

- Unsplash: швидкий (1-2 сек на зображення)
- Pexels: швидкий (1-2 сек на зображення)
- DALL-E: повільний (10-30 сек на зображення)

---

## 📊 Очікувані результати

### Розміри файлів

- **До оптимізації**: 2-5 MB (оригінали з Unsplash/Pexels)
- **Після оптимізації**: 100-300 KB (JPEG 85%, max 1920x1920)
- **DALL-E генерація**: ~200 KB (1024x1024 → оптимізація)

### Час обробки

- **1 зображення (Unsplash/Pexels)**: 2-3 секунди
- **3 зображення (Unsplash/Pexels)**: 5-8 секунд
- **1 зображення (DALL-E)**: 15-30 секунд

### Якість результатів

- ✅ Релевантність: 85-95% (українська назва → англійський запит)
- ✅ Якість: Високоякісні професійні фото
- ✅ Різноманітність: Різні кути та композиції

---

## 🎯 Наступні кроки

1. ✅ Налаштуйте хоча б один API ключ (Unsplash рекомендовано)
2. ✅ Протестуйте створення товару через адмін-панель
3. ✅ Перевірте якість зображень
4. ✅ Налаштуйте frontend для відображення зображень
5. 📈 Масово додайте зображення до існуючих товарів

---

## 📚 Додаткова документація

- [IMAGE_GENERATION_GUIDE.md](backend/IMAGE_GENERATION_GUIDE.md) - Повний технічний посібник
- [AUTO_DESCRIPTION_GUIDE.md](backend/AUTO_DESCRIPTION_GUIDE.md) - Посібник з автоопису
- [NEW_FEATURES.md](NEW_FEATURES.md) - Огляд всіх нових функцій
- [API_EXAMPLES.md](backend/API_EXAMPLES.md) - Приклади API запитів

---

## ❓ FAQ

**Q: Чи можна додавати зображення без опису?**  
A: Так, встановіть `auto_generate_description: false`, `auto_add_images: true`

**Q: Скільки коштує DALL-E?**  
A: ~$0.04 за одне зображення (DALL-E 3, 1024x1024)

**Q: Чи працює без інтернету?**  
A: Ні, потрібен інтернет для доступу до Unsplash/Pexels/OpenAI API

**Q: Чи можна змінити розмір зображень?**  
A: Так, редагуйте `MAX_IMAGE_SIZE` в `image_utils.py` (зараз 1920x1920)

**Q: Що якщо фото не релевантне?**  
A: Перевірте переклад назви в `get_product_search_query()`, додайте власні правила

---

**Готово! 🎉** Ви можете створювати товари з автоматичними зображеннями!
