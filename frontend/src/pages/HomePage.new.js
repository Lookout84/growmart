import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import './HomePage.css';

const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [popularProducts, setPopularProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [categoriesRes, popular] = await Promise.all([
        api.get('/api/products/categories/?page_size=4'),
        api.get('/api/products/?is_popular=true&page_size=4'),
      ]);

      setCategories(categoriesRes.data.results || []);
      setPopularProducts(popular.data.results || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const categoryEmojis = {
    'Полуниця': '🍓',
    'Малина': '🫐',
    'Смородина': '🍇',
    'Агрус': '🌿',
    'Плодові дерева': '🌳',
    'Плодові чагарники': '🌱',
    'Виноград': '🍇',
  };

  if (loading) {
    return <div className="loading">Завантаження...</div>;
  }

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <h1>Якісні саджанці для вашого саду</h1>
        <p>Великий вибір малини, полуниці, смородини та інших ягідних культур</p>
        <Link to="/products" className="hero-btn">Переглянути каталог</Link>
      </section>

      {/* Categories Section */}
      <section className="categories-section">
        <h2 className="section-title">Категорії саджанців</h2>
        <div className="category-grid">
          {categories.map((category) => (
            <Link 
              key={category.id} 
              to={`/products?category=${category.slug}`}
              className="category-card"
            >
              <div className="category-image">
                {categoryEmojis[category.name] || '🌿'}
              </div>
              <div className="category-info">
                <h3>{category.name}</h3>
                <p>{category.description || 'Перегляньте нашу колекцію'}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Popular Products Section */}
      <section className="products-section">
        <div className="products-container">
          <h2 className="section-title">Популярні саджанці</h2>
          <div className="product-grid">
            {popularProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="feature">
          <div className="feature-icon">✅</div>
          <h3>Гарантія якості</h3>
          <p>Всі саджанці проходять ретельну перевірку</p>
        </div>
        <div className="feature">
          <div className="feature-icon">🚚</div>
          <h3>Швидка доставка</h3>
          <p>Доставка по Україні протягом 1-3 днів</p>
        </div>
        <div className="feature">
          <div className="feature-icon">💬</div>
          <h3>Консультації</h3>
          <p>Безкоштовні поради щодо вирощування</p>
        </div>
        <div className="feature">
          <div className="feature-icon">💰</div>
          <h3>Вигідні ціни</h3>
          <p>Знижки на оптові замовлення</p>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
