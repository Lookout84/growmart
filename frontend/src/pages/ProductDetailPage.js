import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import { useAuthStore, useCartStore } from '../store';
import './ProductDetailPage.css';

const ProductDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { setCart } = useCartStore();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProduct();
  }, [slug]);

  const fetchProduct = async () => {
    try {
      const response = await api.get(`/api/products/${slug}/`);
      setProduct(response.data);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Помилка завантаження товару');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.info('Увійдіть, щоб додати товар до кошика');
      navigate('/login');
      return;
    }

    try {
      const response = await api.post('/api/cart/add_item/', {
        product_id: product.id,
        quantity: quantity,
      });
      setCart(response.data);
      toast.success('Товар додано до кошика!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error(error.response?.data?.error || 'Помилка додавання до кошика');
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container">
        <div className="alert alert-danger">Товар не знайдено</div>
      </div>
    );
  }

  return (
    <div className="product-detail-page">
      <div className="container">
        <div className="product-detail-layout">
          <div className="product-images">
            <div className="main-image">
              <img
                src={product.images[selectedImage]?.image || '/placeholder.png'}
                alt={product.name}
              />
            </div>
            {product.images.length > 1 && (
              <div className="image-thumbnails">
                {product.images.map((img, index) => (
                  <img
                    key={img.id}
                    src={img.image}
                    alt={`${product.name} ${index + 1}`}
                    className={index === selectedImage ? 'active' : ''}
                    onClick={() => setSelectedImage(index)}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="product-details">
            <h1>{product.name}</h1>
            <p className="sku">Артикул: {product.sku}</p>

            <div className="product-rating">
              <span className="stars">⭐ {product.average_rating.toFixed(1)}</span>
              <span className="reviews-count">({product.review_count} відгуків)</span>
            </div>

            <div className="product-price-section">
              {product.old_price && (
                <span className="old-price">{product.old_price} ₴</span>
              )}
              <span className="price">{product.final_price} ₴</span>
              {product.discount_percentage > 0 && (
                <span className="discount">-{product.discount_percentage}%</span>
              )}
            </div>

            <div className="product-stock">
              {product.in_stock ? (
                <span className="in-stock">✓ В наявності ({product.stock} шт)</span>
              ) : (
                <span className="out-of-stock">✗ Немає в наявності</span>
              )}
            </div>

            <div className="product-description">
              <h3>Опис</h3>
              <p>{product.description}</p>
            </div>

            {product.brand && (
              <div className="product-brand">
                <strong>Бренд:</strong> {product.brand}
              </div>
            )}

            <div className="product-actions">
              <div className="quantity-selector">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={!product.in_stock}
                >
                  -
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  disabled={!product.in_stock}
                />
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={!product.in_stock}
                >
                  +
                </button>
              </div>

              <button
                className="btn btn-primary btn-large"
                onClick={handleAddToCart}
                disabled={!product.in_stock}
              >
                Додати до кошика
              </button>
            </div>
          </div>
        </div>

        {product.reviews.length > 0 && (
          <div className="reviews-section">
            <h2>Відгуки покупців</h2>
            <div className="reviews-list">
              {product.reviews.map((review) => (
                <div key={review.id} className="review-card">
                  <div className="review-header">
                    <span className="review-author">{review.user}</span>
                    <span className="review-rating">{'⭐'.repeat(review.rating)}</span>
                  </div>
                  <h4>{review.title}</h4>
                  <p>{review.comment}</p>
                  <span className="review-date">
                    {new Date(review.created_at).toLocaleDateString('uk-UA')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;
