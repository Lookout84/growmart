import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import PageLoader from '../components/PageLoader';

const BlogPage = () => {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [postsRes, categoriesRes] = await Promise.all([
        api.get(`/api/products/blog/posts/${selectedCategory ? `?category=${selectedCategory}` : ''}`),
        api.get('/api/products/blog/categories/'),
      ]);

      setPosts(postsRes.data.results || postsRes.data || []);
      setCategories(categoriesRes.data.results || categoriesRes.data || []);
    } catch (error) {
      console.error('Error fetching blog data:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('uk-UA', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              {/* About Shop Section */}
              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-3 text-primary">🌱 Про магазин</h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  «Зелений куточок» — інтернет-магазин саджанців ягідних та декоративних культур. Доставка по всій Україні. Консультації садівника безкоштовно.
                </p>
              </div>

              {/* Categories Section */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">📚 Категорії блогу</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory('')}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                      selectedCategory === ''
                        ? 'bg-primary text-white font-semibold'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Усі статті
                  </button>
                  {categories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-primary text-white font-semibold'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-gray-900 mb-12 text-center lg:text-left">📖 Блог</h1>

            {posts.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <p className="text-gray-600 text-lg">
                  На жаль, статей у цій категорії не знайдено
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map(post => (
                  <Link
                    key={post.id}
                    to={`/blog/${post.slug}`}
                    className="card overflow-hidden group"
                  >
                    {/* Image */}
                    <div className="relative overflow-hidden bg-gray-200 h-48">
                      {post.image ? (
                        <img
                          src={post.image}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary-light text-primary-dark text-4xl">
                          📄
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4 flex flex-col gap-3">
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </h3>

                      <p className="text-sm text-gray-600 line-clamp-2">
                        {post.excerpt || post.content?.substring(0, 100)}
                      </p>

                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-200">
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          📅 {formatDate(post.created_at)}
                        </span>
                        {post.author && (
                          <span className="text-xs text-gray-500">
                            ✍️ {post.author}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
