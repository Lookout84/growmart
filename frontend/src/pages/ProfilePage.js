import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store';
import { Navigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';

const ProfilePage = () => {
  const { isAuthenticated, user, setUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState('info');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const [loadingWishlist, setLoadingWishlist] = useState(false);
  const [deliveryLabels, setDeliveryLabels] = useState({});
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [loadingPassword, setLoadingPassword] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    setFormData({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email || '',
      phone: user.phone || '',
      date_of_birth: user.date_of_birth || '',
      address: user.address || '',
      city: user.city || '',
      postal_code: user.postal_code || '',
      country: user.country || '',
    });
  }, [user]);

  useEffect(() => {
    api.get('/api/orders/delivery-methods/', { params: { _: Date.now() } })
      .then(({ data }) => {
        const map = {};
        data.forEach((m) => { map[m.code] = m.name; });
        setDeliveryLabels(map);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (activeTab !== 'orders') return;
    fetchOrders();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== 'wishlist') return;
    fetchWishlist();
  }, [activeTab]);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const response = await api.get('/api/orders/');
      const ordersData = Array.isArray(response.data) ? response.data : (response.data.results || []);
      setOrders(ordersData);
    } catch (error) {
      console.error('Помилка при завантаженні замовлень:', error);
      toast.error('Помилка при завантаженні замовлень');
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchWishlist = async () => {
    setLoadingWishlist(true);
    try {
      const { data } = await api.get('/api/products/wishlist/');
      const items = Array.isArray(data) ? data : (data.results || []);
      setWishlist(items);
    } catch {
      setWishlist([]);
    } finally {
      setLoadingWishlist(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      await api.post('/api/products/wishlist/', { product_id: productId });
      setWishlist((prev) => prev.filter((item) => item.product.id !== productId));
      toast.success('Видалено з обраного');
    } catch {
      toast.error('Помилка');
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      const response = await api.patch('/api/users/profile/', formData);
      setUser(response.data);
      toast.success('Профіль успішно оновлено');
      setIsEditing(false);
    } catch (error) {
      console.error('Помилка при оновленні профілю:', error);
      toast.error(error.response?.data?.error || 'Помилка при оновленні профілю');
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('Паролі не співпадають');
      return;
    }

    setLoadingPassword(true);
    try {
      await api.post('/api/users/change-password/', {
        old_password: passwordData.old_password,
        new_password: passwordData.new_password,
      });
      
      toast.success('Пароль успішно змінено');
      setPasswordData({
        old_password: '',
        new_password: '',
        confirm_password: '',
      });
    } catch (error) {
      console.error('Помилка при зміні паролю:', error);
      toast.error(error.response?.data?.error || 'Помилка при зміні паролю');
    } finally {
      setLoadingPassword(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { text: 'Очікує', color: 'bg-yellow-100 text-yellow-800' },
      confirmed: { text: 'Підтверджено', color: 'bg-blue-100 text-blue-800' },
      processing: { text: 'Обробляється', color: 'bg-blue-100 text-blue-800' },
      shipped: { text: 'Відправлено', color: 'bg-primary-light text-primary-dark' },
      delivered: { text: 'Доставлено', color: 'bg-green-100 text-green-800' },
      cancelled: { text: 'Скасовано', color: 'bg-red-100 text-red-800' },
      refunded: { text: 'Повернено', color: 'bg-gray-100 text-gray-800' },
    };
    const statusInfo = statusMap[status] || { text: status, color: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`${statusInfo.color} px-3 py-1 rounded-full text-sm font-semibold`}>
        {statusInfo.text}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container max-w-6xl mx-auto px-4">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
            {user?.avatar ? (
              <img 
                src={user.avatar} 
                alt={user?.username} 
                className="w-20 h-20 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-primary flex-shrink-0"
              />
            ) : (
              <div className="w-20 h-20 sm:w-32 sm:h-32 rounded-full bg-primary flex items-center justify-center text-white text-3xl sm:text-4xl font-bold border-4 border-primary flex-shrink-0">
                {user?.first_name?.[0] || user?.username?.[0]}
              </div>
            )}
            <div className="text-center sm:text-left">
              <h1 className="text-xl sm:text-3xl font-bold text-gray-900">
                {user?.first_name} {user?.last_name || user?.username}
              </h1>
              <p className="text-gray-600">@{user?.username}</p>
              <p className="text-gray-500 text-sm mt-2">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8 overflow-x-auto">
          <div className="flex min-w-max">
            <button
              onClick={() => setActiveTab('info')}
              className={`px-4 sm:px-6 py-3 font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'info'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Мій профіль
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 sm:px-6 py-3 font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'orders'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Мої замовлення
            </button>
            <button
              onClick={() => setActiveTab('wishlist')}
              className={`px-4 sm:px-6 py-3 font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'wishlist'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              ♥ Обране
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`px-4 sm:px-6 py-3 font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'security'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Безпека
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'info' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Особиста інформація</h2>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn-primary"
                >
                  ✏️ Редагувати
                </button>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Ім'я</label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleProfileChange}
                      placeholder="Ім'я"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Прізвище</label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleProfileChange}
                      placeholder="Прізвище"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleProfileChange}
                      placeholder="Email"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Телефон</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleProfileChange}
                      placeholder="Телефон"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Дата народження</label>
                  <input
                    type="date"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleProfileChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                  />
                </div>

                <h3 className="text-lg font-bold text-gray-900 mt-6 mb-4">Адреса доставки</h3>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Адреса</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleProfileChange}
                    placeholder="Вулиця, будинок, квартира"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Місто</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleProfileChange}
                      placeholder="Місто"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Поштовий код</label>
                    <input
                      type="text"
                      name="postal_code"
                      value={formData.postal_code}
                      onChange={handleProfileChange}
                      placeholder="Поштовий код"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Країна</label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleProfileChange}
                      placeholder="Країна"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="flex gap-4 mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={handleSaveProfile}
                    className="btn-primary"
                  >
                    💾 Зберегти
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="btn-secondary"
                  >
                    ✕ Скасувати
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-600 font-semibold">Ім'я</p>
                    <p className="text-lg text-gray-900">{formData.first_name || '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-semibold">Прізвище</p>
                    <p className="text-lg text-gray-900">{formData.last_name || '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-semibold">Email</p>
                    <p className="text-lg text-gray-900">{formData.email || '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-semibold">Телефон</p>
                    <p className="text-lg text-gray-900">{formData.phone || '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-semibold">Дата народження</p>
                    <p className="text-lg text-gray-900">{formData.date_of_birth || '—'}</p>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6 mt-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Адреса доставки</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-600 font-semibold">Адреса</p>
                      <p className="text-lg text-gray-900">{formData.address || '—'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-semibold">Місто</p>
                      <p className="text-lg text-gray-900">{formData.city || '—'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-semibold">Поштовий код</p>
                      <p className="text-lg text-gray-900">{formData.postal_code || '—'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-semibold">Країна</p>
                      <p className="text-lg text-gray-900">{formData.country || '—'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Мої замовлення</h2>
            
            {loadingOrders ? (
              <div className="text-center py-12">
                <p className="text-gray-600">Завантаження замовлень...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">У вас ще немає замовлень</p>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map(order => (
                  <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Номер замовлення</p>
                        <p className="text-lg font-semibold text-gray-900">{order.order_number}</p>
                      </div>
                      <div className="mt-2 md:mt-0">
                        {getStatusBadge(order.status)}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 pb-4 border-b border-gray-200">
                      <div>
                        <p className="text-sm text-gray-600">Дата</p>
                        <p className="font-semibold">{new Date(order.created_at).toLocaleDateString('uk-UA')}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Сума</p>
                        <p className="font-semibold text-primary text-lg">₴{Number(order.total || 0).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Спосіб доставки</p>
                        <p className="font-semibold">{deliveryLabels[order.delivery_method] || order.delivery_method}</p>
                      </div>
                    </div>

                    {order.items && order.items.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">Товари:</p>
                        <div className="space-y-2">
                          {order.items.map(item => (
                            <div key={item.id} className="text-sm text-gray-600 flex justify-between">
                              <span>{item.product_name} x {item.quantity}</span>
                              <span className="font-semibold">₴{Number(item.price || 0).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'wishlist' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">♥ Обране</h2>

            {loadingWishlist ? (
              <div className="text-center py-12 text-gray-500">Завантаження...</div>
            ) : wishlist.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-5xl mb-4">🌱</p>
                <p className="text-gray-600 text-lg mb-4">У вас ще немає обраних товарів</p>
                <Link to="/products" className="btn-primary inline-block">Переглянути каталог</Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {wishlist.map(({ id, product }) => (
                  <div key={id} className="group relative bg-white rounded-2xl border border-gray-100 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col">
                    <Link to={`/products/${product.slug}`} className="block">
                      <div className="aspect-square overflow-hidden bg-gray-100">
                        <img
                          src={product.primary_image || '/placeholder.png'}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    </Link>
                    <div className="p-4 flex flex-col gap-2 flex-1">
                      <Link to={`/products/${product.slug}`} className="font-semibold text-sm text-gray-800 line-clamp-2 hover:text-primary">
                        {product.name}
                      </Link>
                      <p className="text-lg font-bold text-red-600 mt-auto">
                        {Math.round(product.final_price || product.price)} грн
                      </p>
                      <button
                        onClick={() => removeFromWishlist(product.id)}
                        className="w-full mt-1 py-2 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 text-sm font-semibold transition-colors"
                      >
                        Видалити з обраного
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'security' && (
          <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Безпека</h2>
            
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Поточний пароль</label>
                <input
                  type="password"
                  name="old_password"
                  value={passwordData.old_password}
                  onChange={handlePasswordChange}
                  placeholder="Введіть поточний пароль"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Новий пароль</label>
                <input
                  type="password"
                  name="new_password"
                  value={passwordData.new_password}
                  onChange={handlePasswordChange}
                  placeholder="Введіть новий пароль"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Повторіть пароль</label>
                <input
                  type="password"
                  name="confirm_password"
                  value={passwordData.confirm_password}
                  onChange={handlePasswordChange}
                  placeholder="Повторіть новий пароль"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                />
              </div>

              <button
                type="submit"
                disabled={loadingPassword}
                className="btn-primary mt-6"
              >
                {loadingPassword ? 'Зміна паролю...' : '🔐 Змінити пароль'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
