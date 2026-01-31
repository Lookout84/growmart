# GrowMart Copilot Instructions

**GrowMart** is a full-stack e-commerce platform for selling plant seedlings (саджанці), built with Django REST Framework backend and React frontend.

## Architecture Overview

### Backend (Django 5.0)
- **Structure**: Microservice-like apps pattern with distinct business domains:
  - `users/`: JWT authentication, user profiles, verification
  - `products/`: Plant categories (hierarchical via `parent` FK), products with Ukrainian locale
  - `cart/`: User shopping carts with `Cart.items` relationship and calculated `total_price`/`total_items` properties
  - `orders/`: Order lifecycle management (pending → shipped → delivered), multiple delivery/payment methods
  - `payments/`: Payment processing integration (Stripe-ready)
- **Key Config**: `settings.py` loads env vars via `decouple` (SECRET_KEY, DB_*, REDIS_URL, CELERY_*)
- **Database**: PostgreSQL with auto-generated migration files in each app's `migrations/`
- **Cache/Queue**: Redis for caching (`django_redis`) and Celery broker; sessions stored in cache
- **API**: DRF with JWT via `rest_framework_simplejwt`, CORS enabled, YAML/Swagger docs via `drf_yasg`

### Frontend (React 18)
- **State Management**: Zustand with persistence middleware (`useAuthStore`, `useCartStore`)
- **API Client**: Axios with interceptors for JWT token injection and auto-refresh on 401
- **Routing**: React Router for multi-page SPA
- **Structure**: Components (Header, Footer, ProductCard), Pages (HomePage, CartPage, CheckoutPage, etc.), Services (api.js)

### Data Flow
1. **User Authentication**: Register/Login → JWT tokens stored in localStorage → Axios interceptor attaches token to requests
2. **Product Browsing**: GET /products?category=slug&search=term → cached category tree with hierarchical navigation
3. **Cart Operations**: Cart OneToOne relationship per user; CartItem tracks quantity; frontend syncs via Zustand state
4. **Checkout**: Cart → Order creation with ORDER_NUMBER, payment method, delivery method → Order status lifecycle

## Development Workflows

### Local Setup
```bash
# Backend
cd backend && python -m venv venv && venv\Scripts\activate  # Windows
pip install -r requirements.txt
# Set .env (copy from docker-compose.yml defaults or SETUP.md)
python manage.py migrate
python manage.py runserver

# Frontend
cd frontend && npm install && npm start  # Runs on :3000
```

### Docker (Recommended)
```bash
docker-compose up -d --build
# Backend at :8000, Frontend at :3000, DB/Redis auto-initialized
# Migrations run on startup; categories.json fixture auto-loads
```

### Database Migrations
```bash
python manage.py makemigrations <app>
python manage.py migrate
# Fixture for categories: products/fixtures/categories.json
```

### Running Async Tasks
Celery configured with Redis broker; tasks defined in `celery.py`. Test with:
```bash
celery -A growmart worker -l info  # Requires Redis running
```

## Project-Specific Conventions

### Django Models & Validation
- **Extended User Model** (`users.models.User`): Inherits from `AbstractUser` with fields like `phone`, `address`, `is_verified`; timestamps auto-set
- **Slug Fields**: Auto-generated from `name` via `slugify()` in `save()` method; used as URL identifiers
- **Pricing Logic**: Products have `price`, `old_price`, `discount_percentage`; use `final_price` property (if defined in model)
- **Stock Management**: Product `stock` has `MinValueValidator(0)`; check stock before adding to order

### API Response Patterns
- **Authentication**: POST `/api/users/login/` returns `{"access": "...", "refresh": "..."}`; client stores both in localStorage
- **Product Queries**: GET `/api/products/?category=<slug>&search=<term>&min_price=100&max_price=1000&in_stock=true`
- **Cart Operations**: Cart accessed via GET `/api/cart/current/` (OneToOne per user); returns nested `items` array
- **Order Creation**: POST `/api/orders/` requires cart items, delivery method, payment method; returns `order_number` for tracking

### Frontend State & Routing
- **Auth State**: Use `useAuthStore` from `store/index.js` to manage `isAuthenticated`, `user`
- **Cart State**: Use `useCartStore` for cart sync; updates persist to Zustand middleware
- **Protected Routes**: Check `isAuthenticated` in page components; redirect to `/login` if unauthorized
- **Token Refresh**: Handled automatically by api.js interceptor; failed refresh logs out user and redirects to /login

### Localization
- **Ukrainian Default**: All model verbose names, admin labels, and fixture data use Ukrainian (Українська)
- **Field Names**: Use verbose_name in Ukrainian for admin display and documentation

## Key Files & Patterns

### Backend Examples
- **API Endpoints**: [backend/growmart/urls.py](../backend/growmart/urls.py) - DRF router setup
- **User Authentication**: [backend/users/serializers.py](../backend/users/serializers.py) - JWT serializer patterns
- **Product Filtering**: [backend/products/views.py](../backend/products/views.py) - SearchFilter, OrderingFilter usage
- **Cart Logic**: [backend/cart/models.py](../backend/cart/models.py) - Property-based totals, unique_together constraints

### Frontend Examples
- **API Service**: [frontend/src/services/api.js](../frontend/src/services/api.js) - Token injection + refresh interceptor
- **Store**: [frontend/src/store/index.js](../frontend/src/store/index.js) - Zustand persist pattern
- **Auth Flow**: [frontend/src/pages/LoginPage.js](../frontend/src/pages/LoginPage.js) - Token storage & redirect logic

## Critical Integration Points

1. **Database Initialization**: Ensure all apps registered in INSTALLED_APPS before users app; migrations auto-discovered per app
2. **Redis Requirement**: Both cache and Celery share Redis; connection string in REDIS_URL env var
3. **CORS Configuration**: Frontend (:3000) can call backend (:8000); corsheaders middleware required
4. **Media Files**: Product images, avatars uploaded to mounted volumes; ensure docker volumes or local media/ directory writable
5. **Fixture Loading**: Categories loaded via `products/fixtures/categories.json` on docker-compose startup; maintain JSON structure for auto-load

## Common Patterns to Avoid

- ❌ Don't fetch full cart in every request; use property methods for totals
- ❌ Don't store sensitive data (tokens, passwords) in Zustand without persist encryption
- ❌ Don't create new Order without order_number generation (use utility if undefined)
- ❌ Don't modify ProductSerializer without updating admin display filters

## Testing & Debugging

- **Backend Errors**: Check `docker-compose logs backend` for Django traceback
- **API Testing**: Use Swagger docs at http://localhost:8000/swagger/ (drf_yasg enabled)
- **Frontend State**: Open browser DevTools, check localStorage for `access_token`, `refresh_token`; inspect Zustand state via React DevTools
- **Database**: Connect to postgres:5432 with credentials from .env; inspect tables directly if needed
