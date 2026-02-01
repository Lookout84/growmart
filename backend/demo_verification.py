#!/usr/bin/env python
"""
Демонстраційний скрипт для верифікації користувачів

Цей скрипт показує як верифікувати користувачів програмно (для тестування)
та демонструє нову функціональність адмін панелі.
"""

import os
import django

# Налаштування Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'growmart.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.core.mail import send_mail

User = get_user_model()


def list_users():
    """Вивести список всіх користувачів і їх статус верифікації"""
    print("\n" + "="*60)
    print("СПИСОК КОРИСТУВАЧІВ")
    print("="*60)
    
    users = User.objects.all()
    if not users.exists():
        print("Користувачів не знайдено")
        return
    
    print(f"Всього користувачів: {users.count()}\n")
    
    for idx, user in enumerate(users, 1):
        status = "✅ ВЕРИФІКОВАНО" if user.is_verified else "❌ НЕ ВЕРИФІКОВАНО"
        print(f"{idx}. {user.username}")
        print(f"   Email: {user.email}")
        print(f"   Статус: {status}")
        print(f"   Дата реєстрації: {user.created_at.strftime('%d.%m.%Y %H:%M')}")
        print()


def verify_user(username):
    """Верифікувати користувача"""
    try:
        user = User.objects.get(username=username)
        if user.is_verified:
            print(f"⚠️  Користувач '{username}' вже верифіков!")
            return False
        
        user.is_verified = True
        user.save()
        print(f"✅ Користувач '{username}' успішно верифіков!")
        return True
    except User.DoesNotExist:
        print(f"❌ Користувач '{username}' не знайдений!")
        return False


def unverify_user(username):
    """Скасувати верифікацію користувача"""
    try:
        user = User.objects.get(username=username)
        if not user.is_verified:
            print(f"⚠️  Користувач '{username}' не верифіков!")
            return False
        
        user.is_verified = False
        user.save()
        print(f"✅ Верифікація користувача '{username}' скасована!")
        return True
    except User.DoesNotExist:
        print(f"❌ Користувач '{username}' не знайдений!")
        return False


def print_instructions():
    """Вивести інструкції для адмін панелі"""
    print("\n" + "="*60)
    print("ІНСТРУКЦІЇ ДЛЯ АДМІН ПАНЕЛІ")
    print("="*60)
    print("""
1. ВЕРИФІКАЦІЯ ОДНОГО КОРИСТУВАЧА:
   - Перейдіть на http://localhost:8000/admin/
   - Перейдіть до розділу "Користувачі"
   - Натисніть на користувача
   - У розділі "Верифікація та контакти" позначте чекбокс "is_verified"
   - Натисніть "Зберегти"

2. МАСОВА ВЕРИФІКАЦІЯ:
   - Перейдіть на http://localhost:8000/admin/
   - Перейдіть до розділу "Користувачі"
   - Виберіть користувачів, позначивши чекбокси
   - У меню "Дії" виберіть дію верифікації
   - Натисніть кнопку "Перейти"

3. ФІЛЬТРАЦІЯ:
   - На сторінці користувачів, виберіть у фільтрі:
     * "is_verified: Yes" - для перегляду верифікованих
     * "is_verified: No" - для перегляду не верифікованих

4. НОВИЙ ФУНКЦІОНАЛ:
   ✓ Дії масової верифікації/скасування верифікації
   ✓ Статус верифікації з емодзі у списку
   ✓ Покращений інтерфейс з групуванням полів
   ✓ Автоматичні емейли при верифікації
""")


def main():
    """Основна функція"""
    print("\n🌿 ДЕМОНСТРАЦІЯ ФУНКЦІОНАЛЬНОСТІ ВЕРИФІКАЦІЇ КОРИСТУВАЧІВ 🌿\n")
    
    # Вивести список користувачів
    list_users()
    
    # Вивести інструкції
    print_instructions()
    
    # Демонстрація команд
    print("\n" + "="*60)
    print("ПРИКЛАДИ ВИКОРИСТАННЯ")
    print("="*60)
    print("""
Для верифікації користувача 'Lookout':
    python manage.py shell -c "exec(open('demo_verification.py').read()); verify_user('Lookout')"

Для скасування верифікації:
    python manage.py shell -c "exec(open('demo_verification.py').read()); unverify_user('Lookout')"

Для перегляду списку користувачів:
    python manage.py shell -c "exec(open('demo_verification.py').read()); list_users()"
""")


if __name__ == '__main__':
    main()
