import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import './BlogPage.css';

const BlogPage = () => {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const [postsRes, categoriesRes] = await Promise.all([
        api.get(`/api/products/blog/posts/?category=${selectedCategory}`),
        api.get('/api/products/blog/categories/'),
      ]);

      setPosts(postsRes.data.results || []);
      setCategories(categoriesRes.data.results || []);
    } catch (error) {
      console.error('Error fetching blog data:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="blog-page">
      <div className="container">
        <h1 className="page-title">📝 Блог</h1>

        <div className="blog-filters">
          <button
            className={`filter-btn ${!selectedCategory ? 'active' : ''}`}
            onClick={() => setSelectedCategory('')}
          >
            Всі статті
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              className={`filter-btn ${selectedCategory === category.slug ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category.slug)}
            >
              {category.name}
            </button>
          ))}
        </div>

        <div className="blog-grid">
          {posts.map((post) => (
            <article key={post.id} className="blog-card">
              {post.image && (
                <div className="blog-image">
                  <img src={post.image} alt={post.title} />
                </div>
              )}
              <div className="blog-content">
                <div className="blog-meta">
                  <span className="blog-date">
                    {new Date(post.published_at).toLocaleDateString('uk-UA', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                  {post.category && (
                    <span className="blog-category">{post.category.name}</span>
                  )}
                </div>
                <h2 className="blog-title">{post.title}</h2>
                <p className="blog-excerpt">{post.excerpt}</p>
                <Link to={`/blog/${post.slug}`} className="blog-read-more">
                  Читати далі →
                </Link>
              </div>
            </article>
          ))}
        </div>

        {posts.length === 0 && (
          <div className="no-posts">
            <p>Немає статей у цій категорії</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogPage;
