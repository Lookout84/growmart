import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import { useAuthStore } from '../store';
import PageLoader from '../components/PageLoader';


const BlogDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: '',
    image: null,
    is_published: false,
  });

  const fetchPost = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/api/products/blog-posts/${slug}/`);
      setPost(response.data);
      setFormData({
        title: response.data.title,
        excerpt: response.data.excerpt,
        content: response.data.content,
        category: response.data.category?.id || '',
        is_published: response.data.is_published,
      });

      // Fetch related posts
      if (response.data.category) {
        const relatedRes = await api.get(
          `/api/products/blog-posts/?category=${response.data.category.slug}`
        );
        setRelatedPosts(
          relatedRes.data.filter((p) => p.id !== response.data.id).slice(0, 3)
        );
      }

      // Increment views count
      if (!isEditing) {
        await api.patch(`/api/products/blog-posts/${slug}/`, {
          views_count: response.data.views_count + 1,
        });
      }
    } catch (error) {
      console.error('Error fetching blog post:', error);
      toast.error('Блог не знайдено');
      navigate('/blog');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [slug]);

  const handleEdit = () => {
    if (!isAuthenticated || (user?.id !== post?.author?.id && !user?.is_staff)) {
      toast.error('Ви не маєте прав редагувати цей блог');
      return;
    }
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('excerpt', formData.excerpt);
      data.append('content', formData.content);
      data.append('category', formData.category);
      data.append('is_published', formData.is_published);

      if (formData.image) {
        data.append('image', formData.image);
      }

      await api.patch(`/api/products/blog-posts/${slug}/`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Блог оновлено');
      setIsEditing(false);
      fetchPost();
    } catch (error) {
      console.error('Error updating blog post:', error);
      toast.error('Помилка при оновленні блогу');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Ви впевнені, що хочете видалити цей блог?')) {
      try {
        await api.delete(`/api/products/blog-posts/${slug}/`);
        toast.success('Блог видалено');
        navigate('/blog');
      } catch (error) {
        console.error('Error deleting blog post:', error);
        toast.error('Помилка при видаленні блогу');
      }
    }
  };

  if (loading) {
    return <PageLoader />;
  }

  if (!post) {
    return <div>Блог не знайдено</div>;
  }

  const isAuthor = isAuthenticated && (user?.id === post.author?.id || user?.is_staff);

  return (
    <div className="blog-detail-page">
      <div className="container">
        <Link to="/blog" className="back-link">← Назад до блогів</Link>

        {isEditing ? (
          <div className="blog-edit-form">
            <h1>Редагування блогу</h1>
            <div className="form-group">
              <label>Заголовок</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label>Витяг</label>
              <textarea
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                className="form-control"
                rows="3"
              />
            </div>
            <div className="form-group">
              <label>Контент</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="form-control"
                rows="10"
              />
            </div>
            <div className="form-group">
              <label>Зображення</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFormData({ ...formData, image: e.target.files?.[0] })}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.is_published}
                  onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                />
                {' '}Опубліковано
              </label>
            </div>
            <div className="blog-actions">
              <button onClick={handleSave} className="btn btn-primary">Зберегти</button>
              <button onClick={() => setIsEditing(false)} className="btn btn-secondary">Скасувати</button>
            </div>
          </div>
        ) : (
          <>
            <article className="blog-detail">
              {post.image && <img src={post.image} alt={post.title} className="blog-detail-image" />}
              
              <div className="blog-detail-meta">
                {post.category && <span className="blog-category">{post.category.name}</span>}
                {post.author && <span className="blog-author">Автор: {post.author.first_name || post.author.username}</span>}
                {post.published_at && (
                  <span className="blog-date">
                    {new Date(post.published_at).toLocaleDateString('uk-UA', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                )}
                <span className="blog-views">👁️ {post.views_count} переглядів</span>
              </div>

              <h1 className="blog-detail-title">{post.title}</h1>
              
              <div className="blog-detail-content">
                {post.content}
              </div>

              {isAuthor && (
                <div className="blog-actions">
                  <button onClick={handleEdit} className="btn btn-primary">✏️ Редагувати</button>
                  <button onClick={handleDelete} className="btn btn-danger">🗑️ Видалити</button>
                </div>
              )}
            </article>

            {relatedPosts.length > 0 && (
              <div className="related-posts">
                <h2>Схожі статті</h2>
                <div className="related-posts-grid">
                  {relatedPosts.map((relPost) => (
                    <Link key={relPost.id} to={`/blog/${relPost.slug}`} className="related-post-card">
                      {relPost.image && <img src={relPost.image} alt={relPost.title} />}
                      <h3>{relPost.title}</h3>
                      <p>{relPost.excerpt}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BlogDetailPage;
