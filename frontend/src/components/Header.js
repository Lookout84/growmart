import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore, useCartStore } from '../store';
import './Header.css';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { totalItems } = useCartStore();

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            <h1>🌱 GrowMart</h1>
          </Link>

          <nav className="nav">
            <Link to="/">Головна</Link>
            <Link to="/products">Товари</Link>
            {isAuthenticated && <Link to="/orders">Мої замовлення</Link>}
          </nav>

          <div className="header-actions">
            <Link to="/cart" className="cart-link">
              🛒 Кошик {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
            </Link>

            {isAuthenticated ? (
              <div className="user-menu">
                <Link to="/profile" className="user-link">
                  👤 {user?.username || 'Профіль'}
                </Link>
                <button onClick={logout} className="btn btn-secondary">
                  Вийти
                </button>
              </div>
            ) : (
              <div className="auth-links">
                <Link to="/login" className="btn btn-outline">
                  Увійти
                </Link>
                <Link to="/register" className="btn btn-primary">
                  Реєстрація
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
