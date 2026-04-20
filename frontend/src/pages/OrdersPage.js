import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../services/api';
import { useAuthStore } from '../store';
import PageLoader from '../components/PageLoader';


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
    return <PageLoader />;
  }

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-teal-100 text-teal-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800',
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
    <div className="min-h-screen bg-gray-50 py-6 sm:py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Мої замовлення</h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="text-5xl mb-4">📦</div>
            <p className="text-gray-500 text-lg">У вас ще немає замовлень</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
                  <div>
                    <h3 className="font-bold text-gray-800">Замовлення #{order.order_number}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {new Date(order.created_at).toLocaleDateString('uk-UA')}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadgeClass(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                </div>

                {/* Items */}
                <div className="px-5 py-3 space-y-2">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-2 text-sm">
                      <span className="text-gray-700 flex-1 min-w-0 truncate">{item.product_name}</span>
                      <span className="text-gray-500 flex-shrink-0">×{item.quantity}</span>
                      <span className="font-semibold text-gray-800 flex-shrink-0">{item.total} ₴</span>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 bg-gray-50 border-t border-gray-100">
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><span className="font-medium">Доставка:</span> {order.delivery_method === 'nova_poshta' ? 'Нова Пошта' : order.delivery_method === 'ukr_poshta' ? 'Укрпошта' : order.delivery_method === 'courier' ? "Кур'єр" : 'Самовивіз'}</p>
                    <p><span className="font-medium">Оплата:</span> {order.payment_method === 'card' ? 'Картка' : order.payment_method === 'cash' ? 'Готівка' : 'Онлайн'}</p>
                    {order.tracking_number && (
                      <p><span className="font-medium">ТТН:</span> {order.tracking_number}</p>
                    )}
                  </div>
                  <div className="font-bold text-lg text-primary">{order.total} ₴</div>
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
