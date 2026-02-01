import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import { useAuthStore, useCartStore } from '../store';


const CartPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { cart, setCart, clearCart } = useCartStore();
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
      const response = await api.post('/api/cart/update_item/', {
        item_id: itemId,
        quantity: quantity,
      });
      setCart(response.data);
      toast.success('Кошик оновлено');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Помилка оновлення');
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      const response = await api.post('/api/cart/remove_item/', {
        item_id: itemId,
      });
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

  if (!isAuthenticated) {
    return (
      <div className="container">
        <div className="cart-empty">
          <h2>Увійдіть до свого акаунту</h2>
          <p>Щоб переглянути кошик, будь ласка, увійдіть</p>
          <Link to="/login" className="btn btn-primary">
            Увійти
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!cart || cart.total_items === 0) {
    return (
      <div className="container">
        <div className="cart-empty">
          <h2>Ваш кошик порожній</h2>
          <p>Додайте товари до кошика, щоб продовжити покупки</p>
          <Link to="/products" className="btn btn-primary">
            Перейти до каталогу
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <h1>Кошик</h1>

        <div className="cart-layout">
          <div className="cart-items">
            {cart.items.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="item-image">
                  <img src={item.product.primary_image || '/placeholder.png'} alt={item.product.name} />
                </div>

                <div className="item-details">
                  <Link to={`/products/${item.product.slug}`} className="item-name">
                    {item.product.name}
                  </Link>
                  <p className="item-price">{item.product.final_price} ₴</p>
                </div>

                <div className="item-quantity">
                  <button onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}>
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}>
                    +
                  </button>
                </div>

                <div className="item-total">
                  <p>{item.total_price} ₴</p>
                </div>

                <button
                  className="item-remove"
                  onClick={() => handleRemoveItem(item.id)}
                >
                  ✕
                </button>
              </div>
            ))}

            <button onClick={handleClearCart} className="btn btn-danger">
              Очистити кошик
            </button>
          </div>

          <div className="cart-summary">
            <h2>Разом</h2>
            <div className="summary-row">
              <span>Кількість товарів:</span>
              <span>{cart.total_items}</span>
            </div>
            <div className="summary-row summary-total">
              <span>Загальна сума:</span>
              <span>{cart.total_price} ₴</span>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="btn btn-primary btn-large"
            >
              Оформити замовлення
            </button>

            <Link to="/products" className="continue-shopping">
              ← Продовжити покупки
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
