import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import './HomePage.css';

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const [featured, newest] = await Promise.all([
        api.get('/api/products/?is_featured=true&page_size=4'),
        api.get('/api/products/?is_new=true&page_size=8'),
      ]);

      setFeaturedProducts(featured.data.results || []);
      setNewProducts(newest.data.results || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="home-page">
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1>Ласкаво просимо до GrowMart</h1>
            <p>Ваш надійний інтернет-магазин для всього необхідного</p>
            <Link to="/products" className="btn btn-primary btn-large">
              Переглянути каталог
            </Link>
          </div>
        </div>
      </section>

      <section className="featured-section">
        <div className="container">
          <h2 className="section-title">⭐ Рекомендовані товари</h2>
          <div className="grid">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="new-products-section">
        <div className="container">
          <h2 className="section-title">🆕 Новинки</h2>
          <div className="grid">
            {newProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="text-center">
            <Link to="/products" className="btn btn-outline">
              Переглянути всі товари
            </Link>
          </div>
        </div>
      </section>

      <section className="features-section">
        <div className="container">
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🚚</div>
              <h3>Швидка доставка</h3>
              <p>Доставка по всій Україні протягом 1-3 днів</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💳</div>
              <h3>Безпечна оплата</h3>
              <p>Оплата готівкою або карткою онлайн</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎁</div>
              <h3>Гарантія якості</h3>
              <p>Всі товари сертифіковані</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📞</div>
              <h3>Підтримка 24/7</h3>
              <p>Завжди готові допомогти</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
