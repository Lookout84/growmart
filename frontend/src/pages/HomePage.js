import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';

const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [popularProducts, setPopularProducts] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return <div className="loading">Завантаження...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-green-500 to-teal-500 text-white text-center">
        <div className="container">
          <h1 className="text-5xl font-bold mb-4">Якісні саджанці для вашого саду</h1>
          <p className="text-xl mb-8 opacity-90">Великий вибір малини, полуниці, смородини та інших ягідних культур</p>
          <Link to="/products" className="inline-block bg-white text-green-600 font-bold px-8 py-3 rounded-full hover:bg-gray-100 transition-colors">
            Переглянути каталог
          </Link>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="container">
          <h2 className="text-3xl font-bold text-center text-primary mb-12">Категорії саджанців</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link 
                key={category.id} 
                to={`/products?category=${category.slug}`}
                className="group overflow-hidden rounded-3xl shadow-md hover:shadow-xl transition-all duration-300 h-40 flex items-end bg-cover bg-center relative border border-gray-100"
                style={{backgroundImage: `url(${category.image || '/placeholder-category.jpg'})`}}
              >
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-all"></div>
                
                {/* Content */}
                <div className="relative w-full p-4 z-10">
                  <h3 className="text-white font-bold text-lg text-center group-hover:text-teal-300 transition-colors">
                    {category.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Products Section */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <h2 className="text-3xl font-bold text-center text-primary mb-12">Популярні саджанці</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">✅</div>
              <h3 className="text-lg font-bold mb-2">Гарантія якості</h3>
              <p className="text-gray-600">Всі саджанці проходять ретельну перевірку</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🚚</div>
              <h3 className="text-lg font-bold mb-2">Швидка доставка</h3>
              <p className="text-gray-600">Доставка по Україні протягом 1-3 днів</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-lg font-bold mb-2">Консультації</h3>
              <p className="text-gray-600">Безкоштовні поради щодо вирощування</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-lg font-bold mb-2">Вигідні ціни</h3>
              <p className="text-gray-600">Знижки на оптові замовлення</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
