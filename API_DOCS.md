# API ENDPOINTS DOCUMENTATION

## Base URL
```
http://localhost:8000/api
```

## Authentication

### Register
```http
POST /users/register/
Content-Type: application/json

{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "password_confirm": "password123",
    "first_name": "John",
    "last_name": "Doe",
    "phone": "+380XXXXXXXXX"
}
```

### Login
```http
POST /users/login/
Content-Type: application/json

{
    "username": "testuser",
    "password": "password123"
}

Response:
{
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### Refresh Token
```http
POST /users/token/refresh/
Content-Type: application/json

{
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### Get Profile
```http
GET /users/profile/
Authorization: Bearer {access_token}
```

## Products

### List Products
```http
GET /products/?page=1&search=laptop&category=1&min_price=100&max_price=1000&in_stock=true
```

### Get Product Detail
```http
GET /products/{slug}/
```

### List Categories
```http
GET /products/categories/
```

## Cart

### Get Current Cart
```http
GET /cart/current/
Authorization: Bearer {access_token}
```

### Add Item to Cart
```http
POST /cart/add_item/
Authorization: Bearer {access_token}
Content-Type: application/json

{
    "product_id": 1,
    "quantity": 2
}
```

### Update Cart Item
```http
POST /cart/update_item/
Authorization: Bearer {access_token}
Content-Type: application/json

{
    "item_id": 1,
    "quantity": 3
}
```

### Remove Cart Item
```http
POST /cart/remove_item/
Authorization: Bearer {access_token}
Content-Type: application/json

{
    "item_id": 1
}
```

### Clear Cart
```http
POST /cart/clear/
Authorization: Bearer {access_token}
```

## Orders

### List Orders
```http
GET /orders/
Authorization: Bearer {access_token}
```

### Create Order
```http
POST /orders/
Authorization: Bearer {access_token}
Content-Type: application/json

{
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "phone": "+380XXXXXXXXX",
    "address": "вул. Хрещатик 1",
    "city": "Київ",
    "postal_code": "01001",
    "country": "Україна",
    "delivery_method": "nova_poshta",
    "payment_method": "cash",
    "notes": "Дзвонити за годину"
}
```

### Cancel Order
```http
POST /orders/{id}/cancel/
Authorization: Bearer {access_token}
```

## Payments

### Create Payment
```http
POST /payments/create_payment/
Authorization: Bearer {access_token}
Content-Type: application/json

{
    "order_id": 1
}
```
