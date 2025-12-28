# GrowMart - Інструкція з розгортання

## Швидкий старт з Docker

### 1. Передумови
- Docker (версія 20.10+)
- Docker Compose (версія 2.0+)

### 2. Крок за кроком

#### Крок 1: Підготовка проєкту
```bash
# Клонуйте репозиторій або перейдіть в папку проєкту
cd growmart

# Створіть файл .env з конфігурацією
cp backend/.env.example backend/.env
```

#### Крок 2: Редагування .env файлу
Відкрийте `backend/.env` і змініть необхідні параметри:
```env
SECRET_KEY=ваш-секретний-ключ-тут
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

DB_NAME=growmart
DB_USER=postgres
DB_PASSWORD=ваш-пароль
DB_HOST=db
DB_PORT=5432

REDIS_URL=redis://redis:6379/1
```

#### Крок 3: Запуск контейнерів
```bash
# Побудуйте та запустіть контейнери
docker-compose up -d --build

# Перевірте статус контейнерів
docker-compose ps
```

#### Крок 4: Ініціалізація бази даних
```bash
# Виконайте міграції
docker-compose exec backend python manage.py migrate

# Створіть суперкористувача для адмін-панелі
docker-compose exec backend python manage.py createsuperuser
```

#### Крок 5: (Опціонально) Завантажте тестові дані
```bash
# Якщо у вас є fixtures
docker-compose exec backend python manage.py loaddata fixtures/initial_data.json
```

### 3. Доступ до сервісів

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Admin Panel**: http://localhost:8000/admin
- **API Docs (Swagger)**: http://localhost:8000/swagger
- **API Docs (ReDoc)**: http://localhost:8000/redoc

### 4. Корисні команди Docker

```bash
# Переглянути логи
docker-compose logs -f

# Переглянути логи конкретного сервісу
docker-compose logs -f backend

# Зупинити контейнери
docker-compose stop

# Запустити контейнери
docker-compose start

# Зупинити та видалити контейнери
docker-compose down

# Видалити контейнери разом з volumes (УВАГА: видалить дані БД)
docker-compose down -v

# Перезапустити конкретний сервіс
docker-compose restart backend

# Виконати команду в контейнері
docker-compose exec backend python manage.py shell
```

## Локальне розгортання (без Docker)

### Backend

#### 1. Встановіть PostgreSQL
- Завантажте та встановіть PostgreSQL
- Створіть базу даних: `createdb growmart`

#### 2. Встановіть Redis
- **Windows**: Використовуйте WSL або Windows Redis port
- **Linux**: `sudo apt-get install redis-server`
- **Mac**: `brew install redis`

#### 3. Python середовище
```bash
cd backend

# Створіть віртуальне середовище
python -m venv venv

# Активуйте його
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Встановіть залежності
pip install -r requirements.txt
```

#### 4. Налаштування
```bash
# Створіть .env файл
cp .env.example .env

# Відредагуйте параметри підключення до БД
# DB_HOST=localhost
# DB_PORT=5432
```

#### 5. Міграції та запуск
```bash
# Міграції
python manage.py migrate

# Створіть суперкористувача
python manage.py createsuperuser

# Збірка статичних файлів
python manage.py collectstatic

# Запустіть сервер
python manage.py runserver
```

#### 6. Запустіть Celery (в окремому терміналі)
```bash
# Windows
celery -A growmart worker -l info --pool=solo

# Linux/Mac
celery -A growmart worker -l info
```

### Frontend

```bash
cd frontend

# Встановіть залежності
npm install

# Запустіть dev сервер
npm start
```

## Production розгортання

### 1. Backend налаштування

#### Змініть settings.py:
```python
DEBUG = False
ALLOWED_HOSTS = ['yourdomain.com', 'www.yourdomain.com']
```

#### Використовуйте Gunicorn:
```bash
pip install gunicorn
gunicorn growmart.wsgi:application --bind 0.0.0.0:8000
```

### 2. Nginx конфігурація

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /admin {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /static/ {
        alias /path/to/growmart/backend/staticfiles/;
    }

    location /media/ {
        alias /path/to/growmart/backend/media/;
    }
}
```

### 3. Frontend build

```bash
cd frontend
npm run build

# Розгорніть папку build на вебсервер
```

### 4. SSL сертифікат (Let's Encrypt)

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## Troubleshooting

### Проблема: Cannot connect to database
**Рішення**: Перевірте, чи запущений PostgreSQL та чи правильні параметри підключення в .env

### Проблема: Redis connection error
**Рішення**: Перевірте, чи запущений Redis: `redis-cli ping` (має повернути PONG)

### Проблема: Port already in use
**Рішення**: 
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:8000 | xargs kill -9
```

### Проблема: Module not found
**Рішення**: Переконайтеся, що віртуальне середовище активоване і всі залежності встановлені

### Проблема: CORS errors
**Рішення**: Перевірте CORS_ALLOWED_ORIGINS в settings.py

## Моніторинг

### Docker stats
```bash
docker-compose stats
```

### Логи
```bash
# Всі логи
docker-compose logs -f

# Backend
docker-compose logs -f backend

# Frontend
docker-compose logs -f frontend

# База даних
docker-compose logs -f db
```

## Backup

### Backup PostgreSQL
```bash
# З Docker
docker-compose exec db pg_dump -U postgres growmart > backup.sql

# Локально
pg_dump -U postgres growmart > backup.sql
```

### Restore
```bash
# З Docker
docker-compose exec -T db psql -U postgres growmart < backup.sql

# Локально
psql -U postgres growmart < backup.sql
```

## Оновлення

```bash
# Оновіть код
git pull

# Перебудуйте контейнери
docker-compose up -d --build

# Виконайте міграції
docker-compose exec backend python manage.py migrate

# Збір статичних файлів
docker-compose exec backend python manage.py collectstatic --noinput
```
