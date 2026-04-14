import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import PopularCarousel from '../components/PopularCarousel';
import PageLoader from '../components/PageLoader';

const CategoriesCarousel = ({ categories }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(4);

  useEffect(() => {
    const update = () => {
      if (window.innerWidth >= 1280) setVisibleCount(5);
      else if (window.innerWidth >= 1024) setVisibleCount(4);
      else if (window.innerWidth >= 640) setVisibleCount(3);
      else setVisibleCount(2);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const maxIndex = Math.max(0, categories.length - visibleCount);

  useEffect(() => { setCurrentIndex(0); }, [visibleCount]);

  useEffect(() => {
    if (categories.length <= visibleCount) return;
    const t = setInterval(() => setCurrentIndex(i => i >= maxIndex ? 0 : i + 1), 3500);
    return () => clearInterval(t);
  }, [maxIndex, categories.length, visibleCount]);

  const prev = () => setCurrentIndex(i => Math.max(0, i - 1));
  const next = () => setCurrentIndex(i => Math.min(maxIndex, i + 1));

  const cardW = 100 / visibleCount;

  if (!categories.length) return null;

  return (
    <div className="relative">
      <button onClick={prev} disabled={currentIndex === 0}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-5 z-10 w-11 h-11 bg-white rounded-full shadow-lg flex items-center justify-center border border-gray-200 text-gray-500 hover:text-green-600 hover:border-green-400 hover:shadow-xl transition-all duration-200 disabled:opacity-30 disabled:cursor-default">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><polyline points="15 18 9 12 15 6" /></svg>
      </button>

      <div className="overflow-hidden">
        <div className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * cardW}%)` }}>
          {categories.map((cat) => (
            <div key={cat.id} className="flex-shrink-0 px-2" style={{ width: `${cardW}%` }}>
              <Link
                to={`/products?category=${cat.id}`}
                className="group block overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 h-36 flex items-end bg-cover bg-center relative border border-gray-100"
                style={{ backgroundImage: `url(${cat.image || '/placeholder-category.jpg'})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent group-hover:from-black/80 transition-all" />
                <div className="relative w-full p-3 z-10 text-center">
                  <h3 className="text-white font-bold text-sm group-hover:text-teal-300 transition-colors line-clamp-2">
                    {cat.name}
                  </h3>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>

      <button onClick={next} disabled={currentIndex >= maxIndex}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-5 z-10 w-11 h-11 bg-white rounded-full shadow-lg flex items-center justify-center border border-gray-200 text-gray-500 hover:text-green-600 hover:border-green-400 hover:shadow-xl transition-all duration-200 disabled:opacity-30 disabled:cursor-default">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><polyline points="9 18 15 12 9 6" /></svg>
      </button>

      {categories.length > visibleCount && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button key={i} onClick={() => setCurrentIndex(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === currentIndex ? 'bg-green-600 w-5' : 'bg-gray-300 hover:bg-gray-400'
              }`} />
          ))}
        </div>
      )}
    </div>
  );
};

const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [popularProducts, setPopularProducts] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [categoriesRes, popular, newProds] = await Promise.all([
        api.get('/api/products/categories/?page_size=100'),
        api.get('/api/products/?is_popular=true&page_size=8'),
        api.get('/api/products/?is_new=true&page_size=8'),
      ]);

      setCategories(categoriesRes.data.results || []);
      setPopularProducts(popular.data.results || []);
      setNewProducts(newProds.data.results || []);
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
    return <PageLoader />;
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
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-bold text-primary">Категорії саджанців</h2>
            <Link to="/products" className="text-green-600 font-semibold hover:underline text-sm">Усі категорії →</Link>
          </div>
          <CategoriesCarousel categories={categories} />
        </div>
      </section>

      {/* New Products Carousel */}
      <PopularCarousel products={newProducts} title="Новинки" linkTo="/products?is_new=true" bgColor="bg-white" />

      {/* Popular Products Carousel */}
      <PopularCarousel products={popularProducts} title="Популярні саджанці" linkTo="/products?is_popular=true" bgColor="bg-gray-50" />

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
