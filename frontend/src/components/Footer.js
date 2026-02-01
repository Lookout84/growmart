import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-primary-dark text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Company */}
          <div>
            <h4 className="font-bold text-lg mb-4">Про компанію</h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="hover:text-primary-light transition-colors">Про нас</Link></li>
              <li><Link to="/advantages" className="hover:text-primary-light transition-colors">Наші переваги</Link></li>
              <li><Link to="/reviews" className="hover:text-primary-light transition-colors">Відгуки</Link></li>
            </ul>
          </div>
          
          {/* Customers */}
          <div>
            <h4 className="font-bold text-lg mb-4">Покупцям</h4>
            <ul className="space-y-2">
              <li><Link to="/delivery" className="hover:text-primary-light transition-colors">Оплата і доставка</Link></li>
              <li><Link to="/guarantees" className="hover:text-primary-light transition-colors">Гарантії</Link></li>
              <li><Link to="/returns" className="hover:text-primary-light transition-colors">Повернення</Link></li>
              <li><Link to="/faq" className="hover:text-primary-light transition-colors">Питання та відповіді</Link></li>
            </ul>
          </div>
          
          {/* Catalog */}
          <div>
            <h4 className="font-bold text-lg mb-4">Каталог</h4>
            <ul className="space-y-2">
              <li><Link to="/products?category=polunycja" className="hover:text-primary-light transition-colors">Полуниця</Link></li>
              <li><Link to="/products?category=malyna" className="hover:text-primary-light transition-colors">Малина</Link></li>
              <li><Link to="/products?category=smorodyna" className="hover:text-primary-light transition-colors">Смородина</Link></li>
              <li><Link to="/products?category=ahrus" className="hover:text-primary-light transition-colors">Агрус</Link></li>
            </ul>
          </div>
          
          {/* Contacts */}
          <div>
            <h4 className="font-bold text-lg mb-4">Контакти</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <span>📞</span>
                <a href="tel:+380979660692" className="hover:text-primary-light transition-colors">+38 (097) 966-06-92</a>
              </li>
              <li className="flex items-center gap-2">
                <span>✉️</span>
                <a href="mailto:info@zelenykutochok.ua" className="hover:text-primary-light transition-colors">info@zelenykutochok.ua</a>
              </li>
              <li className="flex items-center gap-2">
                <span>📍</span>
                <span>Україна</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/20 pt-6 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Зелений Куточок. Всі права захищені.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
