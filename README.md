# GrowMart - Інтернет-магазин

Повнофункціональний інтернет-магазин з адмін-панеллю, побудований на Python (Django), PostgreSQL, Redis та Docker.

## 🚀 Технології

### Backend
- **Django 5.0** - Web framework
- **Django REST Framework** - API
- **PostgreSQL** - База даних
- **Redis** - Кешування і Celery broker
- **Celery** - Асинхронні задачі
- **JWT** - Автентифікація
- **Docker** - Контейнеризація

### Frontend
- **React 18** - UI Framework
- **React Router** - Маршрутизація
- **Zustand** - State management
- **Axios** - HTTP клієнт
- **React Toastify** - Сповіщення

## 📋 Функціональність

### Для покупців:
- ✅ Перегляд каталогу товарів з фільтрацією
- ✅ Пошук товарів
- ✅ Детальна інформація про товар
- ✅ Кошик покупок
- ✅ Оформлення замовлення
- ✅ Реєстрація та авторизація
- ✅ Особистий кабінет
- ✅ Історія замовлень
- ✅ Відгуки про товари

### Адмін-панель (Django Admin):
- ✅ Управління товарами
- ✅ Управління категоріями
- ✅ Управління замовленнями
- ✅ Управління користувачами
- ✅ Модерація відгуків
- ✅ Статистика
- ✅ Українська локалізація

## 🏗️ Структура проєкту

```
growmart/
├── backend/
│   ├── growmart/          # Основні налаштування Django
│   ├── users/             # Модель користувачів
│   ├── products/          # Товари та категорії
│   ├── cart/              # Кошик
│   ├── orders/            # Замовлення
│   ├── payments/          # Платежі
│   ├── manage.py
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/    # Компоненти (Header, Footer, etc.)
│   │   ├── pages/         # Сторінки
│   │   ├── services/      # API сервіси
│   │   ├── store/         # Zustand store
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── Dockerfile
└── docker-compose.yml
```

## 🔧 Встановлення та запуск

### Використання Docker (Рекомендовано)

1. **Клонуйте репозиторій**
```bash
git clone <repository-url>
cd growmart
```

2. **Створіть файл .env в папці backend**
```bash
cp backend/.env.example backend/.env
```

3. **Запустіть контейнери**
```bash
docker-compose up -d --build
```

4. **Створіть суперкористувача для адмін-панелі**
```bash
docker-compose exec backend python manage.py createsuperuser
```

5. **Відкрийте у браузері:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Admin Panel: http://localhost:8000/admin
- API Documentation: http://localhost:8000/swagger

### Локальний запуск (без Docker)

Детальну інструкцію дивіться в [DEPLOYMENT.md](DEPLOYMENT.md)

## 📊 База даних

### Основні моделі:

- **User** - Користувачі з розширеним профілем
- **Category** - Категорії товарів (з підтримкою підкатегорій)
- **Product** - Товари з характеристиками
- **ProductImage** - Зображення товарів
- **Review** - Відгуки користувачів
- **Cart** - Кошик покупок
- **CartItem** - Товари у кошику
- **Order** - Замовлення
- **OrderItem** - Товари у замовленні
- **Payment** - Платежі

## 🎨 Дизайн Frontend

### Колірна схема:
- **Primary**: #27ae60 (зелений) - основний колір
- **Secondary**: #2ecc71 (світло-зелений)
- **Dark**: #2c3e50 (темно-синій)
- **Light**: #ecf0f1 (світло-сірий)
- **Danger**: #e74c3c (червоний)
- **Warning**: #f39c12 (помаранчевий)
- **Info**: #3498db (синій)

### Особливості дизайну:
- 🎯 Сучасний і чистий інтерфейс
- 📱 Responsive дизайн (адаптивний)
- 🎴 Карткова система для товарів
- 🧭 Інтуїтивна навігація
- 📝 Зручні форми
- 🔔 Toast сповіщення

## 🔐 API Endpoints

### Користувачі
- `POST /api/users/register/` - Реєстрація
- `POST /api/users/login/` - Авторизація
- `POST /api/users/token/refresh/` - Оновлення токену
- `GET /api/users/profile/` - Профіль користувача

### Товари
- `GET /api/products/` - Список товарів
- `GET /api/products/{slug}/` - Деталі товару
- `GET /api/products/categories/` - Список категорій

### Кошик
- `GET /api/cart/current/` - Поточний кошик
- `POST /api/cart/add_item/` - Додати товар
- `POST /api/cart/update_item/` - Оновити кількість

### Замовлення
- `GET /api/orders/` - Список замовлень
- `POST /api/orders/` - Створити замовлення
- `POST /api/orders/{id}/cancel/` - Скасувати замовлення

## 👨‍💼 Адмін-панель

Доступна за адресою: http://localhost:8000/admin

### Можливості:
- Повне управління всіма моделями
- Фільтри та пошук
- Масові операції
- Inline редагування
- Модерація відгуків

## 📄 Ліцензія

MIT License