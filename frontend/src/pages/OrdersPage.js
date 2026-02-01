import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../services/api';
import { useAuthStore } from '../store';


const OrdersPage = () => {
  const { isAuthenticated } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated]);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/api/orders/');
      setOrders(response.data.results || response.data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      pending: 'badge-warning',
      confirmed: 'badge-info',
      processing: 'badge-info',
      shipped: 'badge-primary',
      delivered: 'badge-success',
      cancelled: 'badge-danger',
      refunded: 'badge-secondary',
    };
    return statusClasses[status] || 'badge-secondary';
  };

  const getStatusText = (status) => {
    const statusTexts = {
      pending: 'Очікує',
      confirmed: 'Підтверджено',
      processing: 'Обробляється',
      shipped: 'Відправлено',
      delivered: 'Доставлено',
      cancelled: 'Скасовано',
      refunded: 'Повернено',
    };
    return statusTexts[status] || status;
  };

  return (
    <div className="orders-page">
      <div className="container">
        <h1>Мої замовлення</h1>

        {orders.length === 0 ? (
          <div className="no-orders">
            <p>У вас ще немає замовлень</p>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <div>
                    <h3>Замовлення #{order.order_number}</h3>
                    <p className="order-date">
                      {new Date(order.created_at).toLocaleDateString('uk-UA')}
                    </p>
                  </div>
                  <span className={`order-status ${getStatusBadgeClass(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                </div>

                <div className="order-items">
                  {order.items.map((item) => (
                    <div key={item.id} className="order-item">
                      <span className="item-name">{item.product_name}</span>
                      <span className="item-quantity">x{item.quantity}</span>
                      <span className="item-price">{item.total} ₴</span>
                    </div>
                  ))}
                </div>

                <div className="order-footer">
                  <div className="order-info">
                    <p>
                      <strong>Доставка:</strong> {order.delivery_method === 'nova_poshta' ? 'Нова Пошта' :
                        order.delivery_method === 'ukr_poshta' ? 'Укрпошта' :
                        order.delivery_method === 'courier' ? "Кур'єр" : 'Самовивіз'}
                    </p>
                    <p>
                      <strong>Оплата:</strong> {order.payment_method === 'card' ? 'Картка' :
                        order.payment_method === 'cash' ? 'Готівка' : 'Онлайн'}
                    </p>
                    {order.tracking_number && (
                      <p>
                        <strong>ТТН:</strong> {order.tracking_number}
                      </p>
                    )}
                  </div>
                  <div className="order-total">
                    <strong>Всього: {order.total} ₴</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
