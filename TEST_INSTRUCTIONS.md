# ✅ Інструкція для перевірки автогенерації

## Крок 1: Перевірка роботи проекту

```bash
# Переконайтеся що всі контейнери запущені
docker-compose ps

# Всі контейнери мають бути UP
```

## Крок 2: Тест через адмін-панель

1. Відкрити браузер: http://localhost:8000/admin/
2. Ввести логін: `admin`, пароль: `admin123`
3. Натиснути **Products** → **Add product**
4. Заповнити:
   - **Name**: Яблуня Голден Делішес
   - **Category**: Вибрати будь-яку (напр. Саджанці малини)
   - **Price**: 150
   - **Stock**: 50
5. **НЕ заповнювати**:
   - Description
   - Short description
   - SKU
   - Slug
6. Натиснути **Save**
7. ✅ **Перевірити що згенерувалося**:
   - SKU має формат `SKU-XXXXXXXX`
   - Slug заповнений
   - Description містить детальний опис
   - Short description містить короткий опис

## Крок 3: Масова генерація для існуючих товарів

1. Перейти до списку товарів: http://localhost:8000/admin/products/product/
2. Вибрати кілька товарів (checkboxes)
3. В меню "Action" вибрати **"📝 Згенерувати описи (Шаблон)"**
4. Натиснути **Go**
5. ✅ Перевірити що з'явилося повідомлення: "Успішно згенеровано шаблонні описи для X товар(ів)"

## Крок 4: Тест через API (опціонально)

```bash
# 1. Отримати токен
curl -X POST http://localhost:8000/api/users/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'

# Скопіювати access токен з відповіді

# 2. Створити товар (замінити YOUR_TOKEN на реальний токен)
curl -X POST http://localhost:8000/api/products/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Груша Конференція",
    "category": 1,
    "price": 200.00,
    "stock": 30
  }'

# 3. Перевірити відповідь - має містити:
# - sku: "SKU-XXXXXXXX"
# - description: "детальний опис..."
# - short_description: "короткий опис..."
```

## Крок 5: Перевірка логів

```bash
# Перевірити логи backend
docker-compose logs backend | Select-String "генеровано"

# Має з'явитися:
# "OPENAI_API_KEY не знайдено, використовується шаблонний опис"
# Це нормально - використовується шаблонна генерація
```

## Налаштування AI генерації (опціонально)

Якщо хочете спробувати AI генерацію:

1. Отримати безкоштовний API ключ на https://platform.openai.com/
   - Зареєструватися
   - Створити API ключ
   - Поповнити баланс на $5 (для тестування)

2. Додати в `docker-compose.yml`:

```yaml
backend:
  environment:
    # ... інші змінні ...
    - OPENAI_API_KEY=sk-your-api-key-here
```

3. Перезапустити:

```bash
docker-compose restart backend
```

4. Створити товар знову - опис буде згенеровано через AI!

---

## Що перевірити

✅ SKU генерується автоматично (формат `SKU-XXXXXXXX`)  
✅ Slug створюється з назви товару  
✅ Description заповнюється автоматично  
✅ Short description заповнюється автоматично  
✅ Масова генерація працює для багатьох товарів  
✅ API створення товарів працює  
✅ Можна редагувати згенеровані описи  

---

## Документація

📖 Детальні інструкції:
- [NEW_FEATURES.md](NEW_FEATURES.md) - Огляд нових функцій
- [backend/QUICK_START_AUTO_DESCRIPTION.md](backend/QUICK_START_AUTO_DESCRIPTION.md) - Швидкий старт
- [backend/AUTO_DESCRIPTION_GUIDE.md](backend/AUTO_DESCRIPTION_GUIDE.md) - Повна документація
- [backend/API_EXAMPLES.md](backend/API_EXAMPLES.md) - Приклади API

---

**Готово!** 🎉 Автогенерація описів та артикулів працює!
