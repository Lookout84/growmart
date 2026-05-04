import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import PageLoader from '../components/PageLoader';
import useSEO from '../hooks/useSEO';


const ProductsPage = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    min_price: '',
    max_price: '',
    in_stock: false,
  });

  const selectedCategory = categories.find(
    (c) => String(c.id) === String(filters.category) || c.slug === filters.category
  );
  const pageTitle = selectedCategory
    ? `Купити саджанці ${selectedCategory.name.toLowerCase()} — ціни, сорти, доставка`
    : filters.search
    ? `Результати пошуку: ${filters.search}`
    : 'Каталог саджанців — купити з доставкою по Україні';
  const pageDesc = selectedCategory
    ? `${selectedCategory.name} саджанці з доставкою Новою Поштою по всій Україні. Широкий вибір сортів. Гарантія якості. Ціни від 15 грн — Зелений куточок.`
    : 'Каталог саджанців ягідних культур: малина, полуниця, смородина, агрус, лохина. Доставка по Україні.';

  useSEO(pageTitle, pageDesc);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/api/products/categories/');
      setCategories(response.data.results || response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);
      if (filters.min_price) params.append('min_price', filters.min_price);
      if (filters.max_price) params.append('max_price', filters.max_price);
      if (filters.in_stock) params.append('in_stock', 'true');

      const response = await api.get(`/api/products/?${params.toString()}`);
      setProducts(response.data.results || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);
  useEffect(() => { fetchProducts(); }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  const FilterPanel = () => (
    <div className="bg-white rounded-lg p-5 shadow-sm space-y-5">
      {/* Search */}
      <div>
        <h3 className="text-base font-bold mb-2">Пошук</h3>
        <input
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary text-sm"
          placeholder="Пошук товарів..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
        />
      </div>

      {/* Category */}
      <div>
        <h3 className="text-base font-bold mb-2">Категорія</h3>
        <select
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary text-sm"
          value={filters.category}
          onChange={(e) => handleFilterChange('category', e.target.value)}
        >
          <option value="">Всі категорії</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Price */}
      <div>
        <h3 className="text-base font-bold mb-2">Ціна</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary text-sm"
            placeholder="Від"
            value={filters.min_price}
            onChange={(e) => handleFilterChange('min_price', e.target.value)}
          />
          <span className="text-gray-400 flex-shrink-0">—</span>
          <input
            type="number"
            className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary text-sm"
            placeholder="До"
            value={filters.max_price}
            onChange={(e) => handleFilterChange('max_price', e.target.value)}
          />
        </div>
      </div>

      {/* In Stock */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={filters.in_stock}
          onChange={(e) => handleFilterChange('in_stock', e.target.checked)}
          className="w-4 h-4 accent-primary"
        />
        <span className="text-sm">Тільки в наявності</span>
      </label>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <h1 className="text-2xl sm:text-4xl font-bold text-primary mb-6">Каталог товарів</h1>

        {/* Mobile filter toggle */}
        <button
          className="lg:hidden flex items-center gap-2 mb-4 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-semibold text-gray-700 hover:border-primary transition-colors"
          onClick={() => setFiltersOpen(!filtersOpen)}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h18M7 8h10M11 12h2M9 16h6" />
          </svg>
          Фільтри
          <span className="ml-auto">{filtersOpen ? '▲' : '▼'}</span>
        </button>

        {/* Mobile filters panel */}
        {filtersOpen && (
          <div className="lg:hidden mb-4">
            <FilterPanel />
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar — desktop only */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <FilterPanel />
          </aside>

          {/* Products Grid */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <PageLoader fullScreen={false} />
            ) : products.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-lg">
                <p className="text-xl text-gray-500">Товари не знайдено</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
