# Приклади API запитів для автогенерації описів

## Авторизація

Спочатку потрібно отримати токен адміністратора:

```bash
# Отримання токена
curl -X POST http://localhost:8000/api/users/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'

# Відповідь:
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

Використовуйте `access` токен для наступних запитів.

---

## 1. Створення товару з автогенерацією (мінімальні дані)

```bash
curl -X POST http://localhost:8000/api/products/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "name": "Яблуня Голден Делішес",
    "category": 1,
    "price": 150.00,
    "stock": 50
  }'
```

**Відповідь:**
```json
{
  "id": 123,
  "name": "Яблуня Голден Делішес",
  "slug": "yablunia-golden-delishes",
  "category": 1,
  "description": "Яблуня Голден Делішес з категорії Плодові дерева - якісний саджанець для вашого саду...",
  "short_description": "Яблуня Голден Делішес - якісний саджанець для вашого саду...",
  "price": "150.00",
  "stock": 50,
  "sku": "SKU-A5B9C2D1",
  "is_active": true,
  "created_at": "2026-03-29T20:00:00Z"
}
```

---

## 2. Створення товару БЕЗ автогенерації

```bash
curl -X POST http://localhost:8000/api/products/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "name": "Груша Конференція",
    "category": 1,
    "price": 200.00,
    "stock": 30,
    "description": "Мій власний опис товару",
    "short_description": "Короткий опис",
    "auto_generate_description": false
  }'
```

---

## 3. Створення товару з повними даними

```bash
curl -X POST http://localhost:8000/api/products/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "name": "Вишня Шпанка",
    "category": 2,
    "price": 180.00,
    "old_price": 220.00,
    "discount_percentage": 18,
    "stock": 100,
    "variety": "mid",
    "age": "2-річний саджанець",
    "fruit_weight": "6-8 грам",
    "ripening_time": "Кінець червня - початок липня",
    "planting_season": "spring",
    "package_type": "відкритий корінь",
    "brand": "Розсадник GrowMart",
    "weight": 2.5,
    "is_featured": true,
    "is_new": true,
    "is_popular": false,
    "is_in_stock": true,
    "is_promo": true,
    "delivery_info": "НА ВЕСНУ 2026",
    "meta_title": "Купити вишню Шпанка - саджанці",
    "meta_description": "Саджанці вишні Шпанка високої якості"
  }'
```

---

## 4. Отримання списку товарів

```bash
# Всі товари
curl http://localhost:8000/api/products/

# Фільтрація по категорії
curl http://localhost:8000/api/products/?category=1

# Пошук
curl http://localhost:8000/api/products/?search=яблуня

# Фільтр по ціні
curl "http://localhost:8000/api/products/?min_price=100&max_price=200"

# Тільки в наявності
curl http://localhost:8000/api/products/?in_stock=true

# Комбінований фільтр
curl "http://localhost:8000/api/products/?category=1&in_stock=true&min_price=100"
```

---

## 5. Отримання деталей товару

```bash
curl http://localhost:8000/api/products/yablunia-golden-delishes/
```

**Відповідь:**
```json
{
  "id": 123,
  "name": "Яблуня Голден Делішес",
  "slug": "yablunia-golden-delishes",
  "category": {
    "id": 1,
    "name": "Плодові дерева",
    "slug": "plodovi-dereva"
  },
  "description": "Детальний опис товару...",
  "short_description": "Короткий опис...",
  "price": "150.00",
  "old_price": null,
  "discount_percentage": 0,
  "final_price": 150.00,
  "stock": 50,
  "sku": "SKU-A5B9C2D1",
  "in_stock": true,
  "is_featured": false,
  "is_new": true,
  "images": [],
  "reviews": [],
  "average_rating": 0,
  "review_count": 0,
  "created_at": "2026-03-29T20:00:00Z"
}
```

---

## 6. Оновлення товару

```bash
curl -X PATCH http://localhost:8000/api/products/123/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "price": 160.00,
    "stock": 40,
    "description": "Оновлений опис товару"
  }'
```

---

## 7. Видалення товару

```bash
curl -X DELETE http://localhost:8000/api/products/123/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Приклади для Python (requests)

### Створення товару

```python
import requests

# Авторизація
login_response = requests.post('http://localhost:8000/api/users/login/', json={
    'username': 'admin',
    'password': 'admin123'
})
token = login_response.json()['access']

# Створення товару з автогенерацією
headers = {
    'Authorization': f'Bearer {token}',
    'Content-Type': 'application/json'
}

product_data = {
    'name': 'Яблуня Голден Делішес',
    'category': 1,
    'price': 150.00,
    'stock': 50
}

response = requests.post(
    'http://localhost:8000/api/products/',
    json=product_data,
    headers=headers
)

product = response.json()
print(f"Створено товар: {product['name']}")
print(f"SKU: {product['sku']}")
print(f"Опис: {product['description'][:100]}...")
```

---

## Приклади для JavaScript (fetch)

### Створення товару

```javascript
// Авторизація
const loginResponse = await fetch('http://localhost:8000/api/users/login/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'admin',
    password: 'admin123'
  })
});

const { access } = await loginResponse.json();

// Створення товару
const productResponse = await fetch('http://localhost:8000/api/products/', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${access}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Яблуня Голден Делішес',
    category: 1,
    price: 150.00,
    stock: 50
  })
});

const product = await productResponse.json();
console.log('Створено товар:', product.name);
console.log('SKU:', product.sku);
console.log('Опис:', product.description);
```

---

## Корисні ендпоінти

```bash
# Список категорій
curl http://localhost:8000/api/categories/

# Swagger документація
http://localhost:8000/swagger/

# ReDoc документація
http://localhost:8000/redoc/
```

---

## Тестування в Postman

1. Імпортуйте колекцію (створіть новий запит)
2. Встановіть базовий URL: `http://localhost:8000`
3. Додайте Authorization header: `Bearer {{token}}`
4. Створіть змінну `token` з access токеном
5. Тестуйте API!

---

## Помилки та їх вирішення

### 401 Unauthorized
```json
{
  "detail": "Authentication credentials were not provided."
}
```
**Рішення**: Додайте Authorization header з токеном

### 400 Bad Request (validation error)
```json
{
  "name": ["Це поле обов'язкове."],
  "category": ["Це поле обов'язкове."]
}
```
**Рішення**: Перевірте обов'язкові поля

### 403 Forbidden
```json
{
  "detail": "You do not have permission to perform this action."
}
```
**Рішення**: Створення товарів доступне тільки адміністраторам
