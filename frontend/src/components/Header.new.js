import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore, useCartStore } from '../store';
import './Header.css';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { totalItems } = useCartStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="header">
      <nav className="nav-container">
        <Link to="/" className="logo">
          <div className="logo-icon">
            <span className="logo-leaves">🌿</span>
          </div>
          <div className="logo-text">
            <span className="logo-main">Зелений куточок</span>
            <span className="logo-sub">САДЖАНЦІ</span>
          </div>
        </Link>

        <ul className="nav-links">
          <li><Link to="/">Головна</Link></li>
          <li><Link to="/products">Каталог</Link></li>
          <li><Link to="/about">Про нас</Link></li>
          <li><Link to="/contact">Контакти</Link></li>
        </ul>

        <div className="header-right">
          <Link to="/cart" className="cart-icon">
            🛒 Кошик ({totalItems})
          </Link>
          
          {isAuthenticated ? (
            <div className="user-menu">
              <Link to="/profile" className="user-link">{user?.first_name || 'Профіль'}</Link>
              <button onClick={logout} className="logout-btn">Вихід</button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="login-link">Вхід</Link>
              <Link to="/register" className="register-link">Реєстрація</Link>
            </div>
          )}

          <button 
            className={`hamburger ${mobileMenuOpen ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="mobile-menu">
          <ul>
            <li><Link to="/" onClick={closeMobileMenu}>Головна</Link></li>
            <li><Link to="/products" onClick={closeMobileMenu}>Каталог</Link></li>
            <li><Link to="/about" onClick={closeMobileMenu}>Про нас</Link></li>
            <li><Link to="/contact" onClick={closeMobileMenu}>Контакти</Link></li>
            {isAuthenticated ? (
              <>
                <li><Link to="/profile" onClick={closeMobileMenu}>Профіль</Link></li>
                <li><Link to="/orders" onClick={closeMobileMenu}>Замовлення</Link></li>
                <li><button onClick={() => { logout(); closeMobileMenu(); }}>Вихід</button></li>
              </>
            ) : (
              <>
                <li><Link to="/login" onClick={closeMobileMenu}>Вхід</Link></li>
                <li><Link to="/register" onClick={closeMobileMenu}>Реєстрація</Link></li>
              </>
            )}
          </ul>
        </div>
      )}
    </header>
  );
};

export default Header;
