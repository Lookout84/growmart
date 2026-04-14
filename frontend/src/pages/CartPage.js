import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import { useAuthStore, useCartStore } from '../store';
import PageLoader from '../components/PageLoader';


const CartPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { cart, setCart, clearCart, guestItems, updateGuestItem, removeGuestItem, clearGuestCart } = useCartStore();
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    try {
      const response = await api.get('/api/cart/current/');
      setCart(response.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const handleUpdateQuantity = async (itemId, quantity) => {
    try {
      const response = await api.post('/api/cart/update_item/', { item_id: itemId, quantity });
      setCart(response.data);
      toast.success('Кошик оновлено');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Помилка оновлення');
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      const response = await api.post('/api/cart/remove_item/', { item_id: itemId });
      setCart(response.data);
      toast.success('Товар видалено з кошика');
    } catch (error) {
      toast.error('Помилка видалення товару');
    }
  };

  const handleClearCart = async () => {
    if (!window.confirm('Ви впевнені, що хочете очистити кошик?')) return;
    try {
      await api.post('/api/cart/clear/');
      clearCart();
      toast.success('Кошик очищено');
    } catch (error) {
      toast.error('Помилка очищення кошика');
    }
  };

  if (loading) {
    return <PageLoader />;
  }

  // ── Guest cart ───────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    if (guestItems.length === 0) {
      return (
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Ваш кошик порожній</h2>
          <p className="text-gray-500 mb-6">Додайте товари до кошика, щоб продовжити покупки</p>
          <Link to="/products" className="inline-block bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition">
            Перейти до каталогу
          </Link>
        </div>
      );
    }

    const guestTotal = guestItems.reduce((s, i) => {
      const unitPrice = i.variant ? Number(i.variant.price) : (i.product.final_price || i.product.price || 0);
      return s + i.quantity * unitPrice;
    }, 0);
    const guestCount = guestItems.reduce((s, i) => s + i.quantity, 0);

    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Кошик</h1>
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-4">
            {guestItems.map((item) => {
              const unitPrice = item.variant ? Number(item.variant.price) : (item.product.final_price || item.product.price || 0);
              return (
              <div key={item._key} className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <img
                  src={item.product.primary_image || '/placeholder.png'}
                  alt={item.product.name}
                  className="w-20 h-20 object-cover rounded-xl flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <Link to={`/products/${item.product.slug}`} className="font-semibold text-gray-800 hover:text-green-600 line-clamp-2">
                    {item.product.name}
                  </Link>
                  {item.variant && (
                    <p className="text-xs text-gray-500 mt-0.5">{item.variant.name}</p>
                  )}
                  <p className="text-green-600 font-bold mt-1">
                    {unitPrice.toFixed(2)} ₴
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateGuestItem(item._key, item.quantity - 1)}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 font-bold"
                  >−</button>
                  <span className="w-8 text-center font-semibold">{item.quantity}</span>
                  <button
                    onClick={() => updateGuestItem(item._key, item.quantity + 1)}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 font-bold"
                  >+</button>
                </div>
                <div className="text-right w-20 flex-shrink-0">
                  <p className="font-bold text-gray-800">
                    {(unitPrice * item.quantity).toFixed(2)} ₴
                  </p>
                </div>
                <button
                  onClick={() => { removeGuestItem(item._key); toast.success('Товар видалено з кошика'); }}
                  className="text-gray-400 hover:text-red-500 transition ml-2 flex-shrink-0"
                >✕</button>
              </div>
            );})}
            <button
              onClick={() => { if (window.confirm('Очистити кошик?')) { clearGuestCart(); toast.success('Кошик очищено'); } }}
              className="text-sm text-red-500 hover:text-red-700 underline mt-2"
            >
              Очистити кошик
            </button>
          </div>

          <div className="lg:w-80 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-fit">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Разом</h2>
            <div className="flex justify-between text-gray-600 mb-2">
              <span>Кількість товарів:</span>
              <span>{guestCount} шт.</span>
            </div>
            <div className="flex justify-between font-bold text-lg text-gray-800 border-t pt-3 mb-6">
              <span>Загальна сума:</span>
              <span>{guestTotal.toFixed(2)} ₴</span>
            </div>
            <button
              onClick={() => navigate('/checkout')}
              className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition mb-3"
            >
              Оформити замовлення
            </button>
            <Link to="/products" className="block text-center text-green-600 hover:text-green-700 text-sm">
              ← Продовжити покупки
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Auth cart ────────────────────────────────────────────────────────────
  if (!cart || cart.total_items === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Ваш кошик порожній</h2>
        <p className="text-gray-500 mb-6">Додайте товари до кошика, щоб продовжити покупки</p>
        <Link to="/products" className="inline-block bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition">
          Перейти до каталогу
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Кошик</h1>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-4">
          {cart.items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <img
                src={item.product.primary_image || '/placeholder.png'}
                alt={item.product.name}
                className="w-20 h-20 object-cover rounded-xl flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <Link to={`/products/${item.product.slug}`} className="font-semibold text-gray-800 hover:text-green-600 line-clamp-2">
                  {item.product.name}
                </Link>
                {item.variant && (
                  <p className="text-xs text-gray-500 mt-0.5">{item.variant.name}</p>
                )}
                <p className="text-green-600 font-bold mt-1">
                  {item.variant ? Number(item.variant.price).toFixed(2) : item.product.final_price} ₴
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 font-bold"
                >−</button>
                <span className="w-8 text-center font-semibold">{item.quantity}</span>
                <button
                  onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 font-bold"
                >+</button>
              </div>
              <div className="text-right w-20 flex-shrink-0">
                <p className="font-bold text-gray-800">{item.total_price} ₴</p>
              </div>
              <button
                onClick={() => handleRemoveItem(item.id)}
                className="text-gray-400 hover:text-red-500 transition ml-2 flex-shrink-0"
              >✕</button>
            </div>
          ))}
          <button onClick={handleClearCart} className="text-sm text-red-500 hover:text-red-700 underline mt-2">
            Очистити кошик
          </button>
        </div>

        <div className="lg:w-80 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-fit">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Разом</h2>
          <div className="flex justify-between text-gray-600 mb-2">
            <span>Кількість товарів:</span>
            <span>{cart.total_items} шт.</span>
          </div>
          <div className="flex justify-between font-bold text-lg text-gray-800 border-t pt-3 mb-6">
            <span>Загальна сума:</span>
            <span>{cart.total_price} ₴</span>
          </div>
          <button
            onClick={() => navigate('/checkout')}
            className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition mb-3"
          >
            Оформити замовлення
          </button>
          <Link to="/products" className="block text-center text-green-600 hover:text-green-700 text-sm">
            ← Продовжити покупки
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
