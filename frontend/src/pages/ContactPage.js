import React, { useState } from 'react';
import './ContactPage.css';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    alert('Дякуємо за звернення! Ми зв\'яжемось з вами найближчим часом.');
    setFormData({ name: '', email: '', phone: '', message: '' });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="contact-page">
      <div className="contact-hero">
        <div className="container">
          <h1>Контакти</h1>
          <p>Ми завжди раді відповісти на ваші питання</p>
        </div>
      </div>

      <div className="contact-content">
        <div className="container">
          <div className="contact-grid">
            <div className="contact-info">
              <h2>Зв'яжіться з нами</h2>
              
              <div className="contact-item">
                <div className="contact-icon">📞</div>
                <div className="contact-details">
                  <h3>Телефон</h3>
                  <p><a href="tel:+380979660692">+38 (097) 966-06-92</a></p>
                  <p><a href="tel:+380957664505">+38 (095) 766-45-05</a></p>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-icon">✉️</div>
                <div className="contact-details">
                  <h3>Email</h3>
                  <p><a href="mailto:info@zelenykutochok.ua">info@zelenykutochok.ua</a></p>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-icon">📍</div>
                <div className="contact-details">
                  <h3>Адреса</h3>
                  <p>Україна</p>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-icon">🕐</div>
                <div className="contact-details">
                  <h3>Графік роботи</h3>
                  <p>ПН-ПТ: 8:00-18:00</p>
                  <p>СБ: 8:00-15:00</p>
                  <p>НД: Вихідний</p>
                </div>
              </div>
            </div>

            <div className="contact-form-wrapper">
              <h2>Написати нам</h2>
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="name">Ім'я *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Введіть ваше ім'я"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="your@email.com"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Телефон</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+38 (0__) ___-__-__"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="message">Повідомлення *</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="5"
                    placeholder="Введіть ваше повідомлення"
                  ></textarea>
                </div>

                <button type="submit" className="submit-btn">
                  Відправити
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
