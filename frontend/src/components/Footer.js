import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>🌱 GrowMart</h3>
            <p>Ваш надійний інтернет-магазин</p>
          </div>

          <div className="footer-section">
            <h4>Компанія</h4>
            <ul>
              <li><a href="/about">Про нас</a></li>
              <li><a href="/contact">Контакти</a></li>
              <li><a href="/delivery">Доставка</a></li>
              <li><a href="/payment">Оплата</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Допомога</h4>
            <ul>
              <li><a href="/faq">FAQ</a></li>
              <li><a href="/returns">Повернення</a></li>
              <li><a href="/privacy">Політика конфіденційності</a></li>
              <li><a href="/terms">Умови використання</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Контакти</h4>
            <ul>
              <li>📧 info@growmart.com</li>
              <li>📞 +380 XX XXX XX XX</li>
              <li>📍 Україна, Київ</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2025 GrowMart. Всі права захищено.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
