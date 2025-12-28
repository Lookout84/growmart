import React, { useEffect, useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import { useAuthStore, useCartStore } from '../store';
import './CheckoutPage.css';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const { cart, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    postal_code: user?.postal_code || '',
    country: user?.country || 'Україна',
    delivery_method: 'nova_poshta',
    payment_method: 'cash',
    notes: '',
  });

  useEffect(() => {
    if (isAuthenticated && (!cart || cart.total_items === 0)) {
      navigate('/cart');
    }
  }, [cart, isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/api/orders/', formData);
      clearCart();
      toast.success('Замовлення успішно оформлено!');
      navigate(`/orders`);
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error.response?.data?.error || 'Помилка оформлення замовлення');
    } finally {
      setLoading(false);
    }
  };

  if (!cart || cart.total_items === 0) {
    return null;
  }

  return (
    <div className="checkout-page">
      <div className="container">
        <h1>Оформлення замовлення</h1>

        <div className="checkout-layout">
          <form onSubmit={handleSubmit} className="checkout-form">
            <h2>Контактна інформація</h2>
            <div className="form-row">
              <div className="form-group">
                <label>Ім'я *</label>
                <input
                  type="text"
                  name="first_name"
                  className="form-control"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Прізвище *</label>
                <input
                  type="text"
                  name="last_name"
                  className="form-control"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Телефон *</label>
                <input
                  type="tel"
                  name="phone"
                  className="form-control"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <h2>Адреса доставки</h2>
            <div className="form-group">
              <label>Адреса *</label>
              <input
                type="text"
                name="address"
                className="form-control"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Місто *</label>
                <input
                  type="text"
                  name="city"
                  className="form-control"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Індекс</label>
                <input
                  type="text"
                  name="postal_code"
                  className="form-control"
                  value={formData.postal_code}
                  onChange={handleChange}
                />
              </div>
            </div>

            <h2>Спосіб доставки</h2>
            <div className="form-group">
              <select
                name="delivery_method"
                className="form-control"
                value={formData.delivery_method}
                onChange={handleChange}
                required
              >
                <option value="nova_poshta">Нова Пошта</option>
                <option value="ukr_poshta">Укрпошта</option>
                <option value="courier">Кур'єр</option>
                <option value="pickup">Самовивіз</option>
              </select>
            </div>

            <h2>Спосіб оплати</h2>
            <div className="form-group">
              <select
                name="payment_method"
                className="form-control"
                value={formData.payment_method}
                onChange={handleChange}
                required
              >
                <option value="cash">Готівка при отриманні</option>
                <option value="card">Оплата карткою</option>
                <option value="online">Онлайн оплата</option>
              </select>
            </div>

            <div className="form-group">
              <label>Примітки до замовлення</label>
              <textarea
                name="notes"
                className="form-control"
                rows="4"
                value={formData.notes}
                onChange={handleChange}
              />
            </div>

            <button type="submit" className="btn btn-primary btn-large" disabled={loading}>
              {loading ? 'Оформлення...' : 'Підтвердити замовлення'}
            </button>
          </form>

          <div className="order-summary">
            <h2>Ваше замовлення</h2>
            <div className="summary-items">
              {cart.items.map((item) => (
                <div key={item.id} className="summary-item">
                  <span>{item.product.name} x{item.quantity}</span>
                  <span>{item.total_price} ₴</span>
                </div>
              ))}
            </div>
            <div className="summary-total">
              <span>Всього:</span>
              <span>{cart.total_price} ₴</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
