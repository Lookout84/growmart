import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>Про компанію</h4>
          <ul>
            <li><Link to="/about">Про нас</Link></li>
            <li><Link to="/advantages">Наші переваги</Link></li>
            <li><Link to="/reviews">Відгуки</Link></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>Покупцям</h4>
          <ul>
            <li><Link to="/delivery">Оплата і доставка</Link></li>
            <li><Link to="/guarantees">Гарантії</Link></li>
            <li><Link to="/returns">Повернення</Link></li>
            <li><Link to="/faq">Питання та відповіді</Link></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>Каталог</h4>
          <ul>
            <li><Link to="/products?category=polunycja">Полуниця</Link></li>
            <li><Link to="/products?category=malyna">Малина</Link></li>
            <li><Link to="/products?category=smorodyna">Смородина</Link></li>
            <li><Link to="/products?category=ahrus">Агрус</Link></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>Контакти</h4>
          <ul className="contact-list">
            <li>
              <span className="icon">📞</span>
              <a href="tel:+380979660692">+38 (097) 966-06-92</a>
            </li>
            <li>
              <span className="icon">✉️</span>
              <a href="mailto:info@zelenykutochok.ua">info@zelenykutochok.ua</a>
            </li>
            <li>
              <span className="icon">📍</span>
              <span>Україна</span>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Зелений Куточок. Всі права захищені.</p>
      </div>
    </footer>
  );
};

export default Footer;
