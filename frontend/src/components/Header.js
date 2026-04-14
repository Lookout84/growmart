import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore, useCartStore } from '../store';
import logo from '../images/logo.png';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { totalItems, items, guestItems } = useCartStore();
  const cartCount = isAuthenticated
    ? items.length
    : guestItems.length;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img src={logo} alt="Зелений куточок" className="h-16 w-auto" />
            <div className="flex flex-col">
              <span className="font-bold text-primary text-xl leading-tight">Зелений куточок</span>
              <span className="text-xs text-gray-500 font-medium tracking-wide">САДЖАНЦІ ЯГІД</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <ul className="hidden md:flex items-center gap-8">
            <li><Link to="/" className="text-gray-700 hover:text-primary font-semibold transition-colors">Головна</Link></li>
            <li><Link to="/products" className="text-gray-700 hover:text-primary font-semibold transition-colors">Каталог</Link></li>
            <li><Link to="/blog" className="text-gray-700 hover:text-primary font-semibold transition-colors">Блог</Link></li>
            <li><Link to="/about" className="text-gray-700 hover:text-primary font-semibold transition-colors">Про нас</Link></li>
            <li><Link to="/contact" className="text-gray-700 hover:text-primary font-semibold transition-colors">Контакти</Link></li>
          </ul>

          {/* Right Menu */}
          <div className="flex items-center gap-4">
            {/* Cart Icon */}
            <Link to="/cart" className="flex items-center gap-2 text-gray-700 hover:text-primary font-semibold transition-colors">
              <span className="text-xl">🛒</span>
              <span className="hidden sm:inline">({cartCount})</span>
            </Link>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <span className="hidden sm:inline text-gray-700 font-semibold">{user?.first_name || user?.username}</span>
                <Link
                  to="/profile"
                  className="hidden sm:inline px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-semibold"
                >
                  Профіль
                </Link>
                <button
                  onClick={() => {
                    logout();
                    closeMobileMenu();
                  }}
                  className="hidden sm:inline px-4 py-2 border-2 border-primary text-primary rounded-lg hover:bg-primary-light transition-colors font-semibold"
                >
                  Вихід
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link
                  to="/login"
                  className="hidden sm:inline px-4 py-2 text-primary font-semibold hover:text-primary-dark transition-colors"
                >
                  Вхід
                </Link>
                <Link
                  to="/register"
                  className="hidden sm:inline px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-semibold"
                >
                  Реєстрація
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex flex-col gap-1.5"
            >
              <span className="w-6 h-0.5 bg-gray-700"></span>
              <span className="w-6 h-0.5 bg-gray-700"></span>
              <span className="w-6 h-0.5 bg-gray-700"></span>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-gray-50 border-t border-gray-200 py-4 px-4 space-y-3">
            <Link
              to="/"
              onClick={closeMobileMenu}
              className="block text-gray-700 font-semibold hover:text-primary transition-colors"
            >
              Головна
            </Link>
            <Link
              to="/products"
              onClick={closeMobileMenu}
              className="block text-gray-700 font-semibold hover:text-primary transition-colors"
            >
              Каталог
            </Link>
            <Link
              to="/blog"
              onClick={closeMobileMenu}
              className="block text-gray-700 font-semibold hover:text-primary transition-colors"
            >
              Блог
            </Link>
            <Link
              to="/about"
              onClick={closeMobileMenu}
              className="block text-gray-700 font-semibold hover:text-primary transition-colors"
            >
              Про нас
            </Link>
            <Link
              to="/contact"
              onClick={closeMobileMenu}
              className="block text-gray-700 font-semibold hover:text-primary transition-colors"
            >
              Контакти
            </Link>
            
            <div className="border-t border-gray-300 pt-3">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    onClick={closeMobileMenu}
                    className="block text-gray-700 font-semibold hover:text-primary transition-colors mb-2"
                  >
                    👤 Профіль
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      closeMobileMenu();
                    }}
                    className="w-full px-4 py-2 border-2 border-primary text-primary rounded-lg font-semibold"
                  >
                    Вихід
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={closeMobileMenu}
                    className="block text-gray-700 font-semibold hover:text-primary transition-colors mb-2"
                  >
                    Вхід
                  </Link>
                  <Link
                    to="/register"
                    onClick={closeMobileMenu}
                    className="block px-4 py-2 bg-primary text-white rounded-lg font-semibold text-center"
                  >
                    Реєстрація
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
