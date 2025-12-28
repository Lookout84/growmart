import React, { useEffect, useState } from 'react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import './ProductsPage.css';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    min_price: '',
    max_price: '',
    in_stock: false,
  });

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, [filters]);

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

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  return (
    <div className="products-page">
      <div className="container">
        <h1>Каталог товарів</h1>

        <div className="products-layout">
          <aside className="filters-sidebar">
            <div className="filter-group">
              <h3>Пошук</h3>
              <input
                type="text"
                className="form-control"
                placeholder="Пошук товарів..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>

            <div className="filter-group">
              <h3>Категорія</h3>
              <select
                className="form-control"
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <option value="">Всі категорії</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <h3>Ціна</h3>
              <div className="price-range">
                <input
                  type="number"
                  className="form-control"
                  placeholder="Від"
                  value={filters.min_price}
                  onChange={(e) => handleFilterChange('min_price', e.target.value)}
                />
                <span>-</span>
                <input
                  type="number"
                  className="form-control"
                  placeholder="До"
                  value={filters.max_price}
                  onChange={(e) => handleFilterChange('max_price', e.target.value)}
                />
              </div>
            </div>

            <div className="filter-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={filters.in_stock}
                  onChange={(e) => handleFilterChange('in_stock', e.target.checked)}
                />
                Тільки в наявності
              </label>
            </div>
          </aside>

          <div className="products-content">
            {loading ? (
              <div className="loading">
                <div className="spinner"></div>
              </div>
            ) : products.length > 0 ? (
              <div className="grid">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="no-products">
                <p>Товари не знайдено</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
