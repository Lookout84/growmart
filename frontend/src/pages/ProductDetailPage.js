import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import { useAuthStore, useCartStore } from '../store';
import PageLoader from '../components/PageLoader';
import ProductCard from '../components/ProductCard';


const ProductDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const { setCart, addGuestItem } = useCartStore();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('description');
  const [selectedVariant, setSelectedVariant] = useState(null);

  // Related products state
  const [related, setRelated] = useState([]);

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [userReview, setUserReview] = useState(undefined); // undefined=not fetched, null=none, obj=exists
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchProduct = async () => {
    try {
      const response = await api.get(`/api/products/${slug}/`);
      const prod = response.data;
      setProduct(prod);
      // Fetch related products from same category, excluding current
      if (prod.category?.id) {
        try {
          const rel = await api.get(`/api/products/?category=${prod.category.id}&page_size=4`);
          const items = (rel.data.results || rel.data).filter(p => p.slug !== slug);
          setRelated(items.slice(0, 4));
        } catch { /* silent */ }
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Помилка завантаження товару');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [slug]);

  const fetchReviews = useCallback(async (productId) => {
    setReviewsLoading(true);
    try {
      const res = await api.get(`/api/products/reviews/?product=${productId}`);
      setReviews(res.data.results || res.data);
    } catch {
      // silent
    } finally {
      setReviewsLoading(false);
    }
  }, []);

  const fetchUserReview = useCallback(async (productId) => {
    if (!isAuthenticated) { setUserReview(null); return; }
    try {
      const res = await api.get(`/api/products/reviews/my_review/?product=${productId}`);
      setUserReview(res.data || null);
    } catch {
      setUserReview(null);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (activeTab === 'reviews' && product) {
      fetchReviews(product.id);
      fetchUserReview(product.id);
    }
  }, [activeTab, product, fetchReviews, fetchUserReview]);

  // Auto-select first active variant when product loads
  useEffect(() => {
    if (product?.variants?.length > 0) {
      const active = product.variants.find(v => v.is_active);
      setSelectedVariant(active || null);
    } else {
      setSelectedVariant(null);
    }
  }, [product]);

  const hasVariants = product?.variants?.length > 0;
  const displayPrice = selectedVariant
    ? Number(selectedVariant.price)
    : Number(product?.final_price || product?.price || 0);
  const availableStock = selectedVariant ? selectedVariant.stock : (product?.stock || 0);

  const handleAddToCart = async () => {
    if (hasVariants && !selectedVariant) {
      toast.warning('Оберіть варіант товару');
      return;
    }
    if (!isAuthenticated) {
      addGuestItem(product, quantity, selectedVariant);
      toast.success('Товар додано до кошика!');
      return;
    }

    try {
      const payload = { product_id: product.id, quantity };
      if (selectedVariant) payload.variant_id = selectedVariant.id;
      const res = await api.post('/api/cart/add_item/', payload);
      setCart(res.data);
      toast.success('Товар додано до кошика!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error(error.response?.data?.error || 'Помилка додавання до кошика');
    }
  };

  const incrementQuantity = () => {
    if (quantity < availableStock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewForm.comment.trim() || reviewForm.comment.trim().length < 10) {
      toast.error('Відгук має містити щонайменше 10 символів');
      return;
    }
    setSubmittingReview(true);
    try {
      await api.post('/api/products/reviews/', {
        product: product.id,
        rating: reviewForm.rating,
        comment: reviewForm.comment.trim(),
      });
      toast.success('Відгук надіслано на модерацію!');
      setReviewForm({ rating: 5, comment: '' });
      await fetchUserReview(product.id);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Помилка надсилання відгуку');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!userReview) return;
    try {
      await api.delete(`/api/products/reviews/${userReview.id}/`);
      toast.success('Відгук видалено');
      setUserReview(null);
      setReviewForm({ rating: 5, comment: '' });
      fetchReviews(product.id);
    } catch {
      toast.error('Помилка видалення відгуку');
    }
  };

  if (loading) {
    return <PageLoader />;
  }

  if (!product) {
    return (
      <div className="container py-20">
        <div className="text-center text-red-500">Товар не знайдено</div>
      </div>
    );
  }

  const mainImage = product.images?.[selectedImage]?.image || product.primary_image || '/placeholder.png';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white py-3 border-b border-gray-200">
        <div className="container">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link to="/" className="hover:text-primary">Головна</Link>
            <span>→</span>
            <Link to="/products" className="hover:text-primary">Товари</Link>
            <span>→</span>
            <span className="text-gray-900 font-medium">{product.name}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm p-4 sticky top-4">
              {/* Main Image */}
              <div className="bg-gray-100 rounded-2xl overflow-hidden mb-4 aspect-square flex items-center justify-center">
                <img 
                  src={mainImage} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Thumbnails */}
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.map((img, index) => (
                    <button
                      key={img.id}
                      onClick={() => setSelectedImage(index)}
                      className={`rounded-lg overflow-hidden border-2 aspect-square flex items-center justify-center transition-all ${
                        index === selectedImage 
                          ? 'border-primary' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img 
                        src={img.image} 
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Info */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-sm p-8">
              {/* Status Badge */}
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                  ✓ В наявності
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>

              {/* Sku and Rating */}
              <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200">
                <p className="text-sm text-gray-600">Артикул: {product.sku || product.id}</p>
                <div className="flex items-center gap-3">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <span 
                        key={i}
                        className={`text-lg ${
                          i < Math.floor(product.average_rating || 5) ? 'text-orange-400' : 'text-gray-300'
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">
                    {product.reviews_count || 0} відгуків
                  </p>
                </div>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-3">
                  {product.old_price && !selectedVariant && (
                    <span className="text-lg text-gray-400 line-through">
                      {Math.round(product.old_price)} грн
                    </span>
                  )}
                  <span className="text-4xl font-bold text-red-600">
                    {Math.round(displayPrice)} грн
                  </span>
                </div>
              </div>

              {/* Variant selector */}
              {hasVariants && (
                <div className="mb-6">
                  <p className="font-semibold text-gray-700 mb-2">Розмір кореневої системи:</p>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.filter(v => v.is_active).map(v => (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariant(v)}
                        className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                          selectedVariant?.id === v.id
                            ? 'border-teal-500 bg-teal-50 text-teal-700'
                            : 'border-gray-300 bg-white text-gray-700 hover:border-teal-400'
                        } ${v.stock === 0 ? 'opacity-40 cursor-not-allowed' : ''}`}
                        disabled={v.stock === 0}
                        title={v.stock === 0 ? 'Немає в наявності' : ''}
                      >
                        {v.name}
                        <span className="ml-1 text-xs opacity-70">— {Math.round(Number(v.price))} грн</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="flex items-center gap-4 mb-6">
                <span className="font-semibold text-gray-700">Кількість:</span>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button 
                    onClick={() => { if (quantity > 1) setQuantity(quantity - 1); }}
                    className="px-4 py-2 text-lg hover:bg-gray-100 disabled:opacity-50"
                    disabled={quantity <= 1}
                  >
                    −
                  </button>
                  <input 
                    type="number" 
                    value={quantity}
                    readOnly
                    className="w-12 text-center border-l border-r border-gray-300 py-2"
                  />
                  <button 
                    onClick={incrementQuantity}
                    className="px-4 py-2 text-lg hover:bg-gray-100 disabled:opacity-50"
                    disabled={quantity >= availableStock}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-4 rounded-2xl transition-colors mb-4 flex items-center justify-center gap-2 text-lg"
              >
                <span>🛒</span>
                Купити
              </button>

              {/* Special Features */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {product.variety && (
                  <div className="bg-gray-50 p-3 rounded-lg text-sm">
                    <p className="text-gray-600 font-semibold">Сорт</p>
                    <p className="text-gray-900">{product.variety}</p>
                  </div>
                )}
                {product.ripening_time && (
                  <div className="bg-gray-50 p-3 rounded-lg text-sm">
                    <p className="text-gray-600 font-semibold">Стиглість</p>
                    <p className="text-gray-900">{product.ripening_time}</p>
                  </div>
                )}
                {product.age && (
                  <div className="bg-gray-50 p-3 rounded-lg text-sm">
                    <p className="text-gray-600 font-semibold">Вік</p>
                    <p className="text-gray-900">{product.age}</p>
                  </div>
                )}
                {product.height && (
                  <div className="bg-gray-50 p-3 rounded-lg text-sm">
                    <p className="text-gray-600 font-semibold">Висота</p>
                    <p className="text-gray-900">{product.height}</p>
                  </div>
                )}
              </div>

              {/* Info Sections */}
              <div className="space-y-4 text-sm">
                <div className="flex gap-3 p-3 bg-blue-50 rounded-lg">
                  <span className="text-lg">🚚</span>
                  <div>
                    <p className="font-semibold text-gray-900">Доставка</p>
                    <p className="text-gray-600">По Україні 1-3 дні</p>
                  </div>
                </div>

                <div className="flex gap-3 p-3 bg-green-50 rounded-lg">
                  <span className="text-lg">💳</span>
                  <div>
                    <p className="font-semibold text-gray-900">Оплата</p>
                    <p className="text-gray-600">Карта, готівка, переводом</p>
                  </div>
                </div>

                <div className="flex gap-3 p-3 bg-orange-50 rounded-lg">
                  <span className="text-lg">✅</span>
                  <div>
                    <p className="font-semibold text-gray-900">Гарантія</p>
                    <p className="text-gray-600">На весь товар розповсюджується</p>
                  </div>
                </div>
              </div>

              {/* Social Share */}
              <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                <p className="text-gray-600 font-semibold">Поділитися:</p>
                <button className="w-8 h-8 bg-gray-100 rounded-full hover:bg-primary hover:text-white flex items-center justify-center transition-all">
                  f
                </button>
                <button className="w-8 h-8 bg-gray-100 rounded-full hover:bg-primary hover:text-white flex items-center justify-center transition-all">
                  🔗
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-12 bg-white rounded-3xl shadow-sm overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('description')}
                className={`flex-1 py-4 font-semibold text-center transition-colors ${
                  activeTab === 'description'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Опис
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`flex-1 py-4 font-semibold text-center transition-colors ${
                  activeTab === 'reviews'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Відгуки {product.review_count > 0 && <span className="ml-1 text-sm text-gray-400">({product.review_count})</span>}
              </button>
            </div>
          </div>

          <div className="p-8">
            {activeTab === 'description' && (
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {product.description || 'Опис товару відсутній'}
                </p>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                {/* Rating summary */}
                {reviews.length > 0 && (
                  <div className="flex items-center gap-6 p-5 bg-gray-50 rounded-2xl mb-8">
                    <div className="text-center shrink-0">
                      <div className="text-5xl font-bold text-gray-900">
                        {reviews.length > 0
                          ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
                          : '—'}
                      </div>
                      <div className="flex justify-center gap-0.5 mt-1">
                        {[1,2,3,4,5].map(s => (
                          <span key={s} className={`text-xl ${s <= Math.round(reviews.reduce((a,r)=>a+r.rating,0)/reviews.length) ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
                        ))}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">{reviews.length} відгуків</div>
                    </div>
                  </div>
                )}

                {/* User review status / form */}
                {isAuthenticated ? (
                  userReview === undefined ? null : userReview ? (
                    <div className="mb-8">
                      {userReview.status === 'pending' && (
                        <div className="flex items-start gap-4 p-5 bg-yellow-50 border border-yellow-200 rounded-2xl">
                          <span className="text-2xl">⏳</span>
                          <div className="flex-1">
                            <p className="font-semibold text-yellow-800">Ваш відгук очікує модерації</p>
                            <div className="flex gap-0.5 mt-1">
                              {[1,2,3,4,5].map(s => (
                                <span key={s} className={`text-lg ${s <= userReview.rating ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
                              ))}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{userReview.comment}</p>
                          </div>
                          <button onClick={handleDeleteReview} className="text-sm text-red-500 hover:text-red-700 shrink-0">Видалити</button>
                        </div>
                      )}
                      {userReview.status === 'approved' && (
                        <div className="flex items-start gap-4 p-5 bg-green-50 border border-green-200 rounded-2xl">
                          <span className="text-2xl">✅</span>
                          <div className="flex-1">
                            <p className="font-semibold text-green-800">Ваш відгук опубліковано</p>
                            <div className="flex gap-0.5 mt-1">
                              {[1,2,3,4,5].map(s => (
                                <span key={s} className={`text-lg ${s <= userReview.rating ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
                              ))}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{userReview.comment}</p>
                          </div>
                          <button onClick={handleDeleteReview} className="text-sm text-red-500 hover:text-red-700 shrink-0">Видалити</button>
                        </div>
                      )}
                      {userReview.status === 'rejected' && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-2xl">
                          <p className="text-red-700 font-semibold mb-1">❌ Ваш попередній відгук відхилено</p>
                          <p className="text-sm text-gray-600">Ви можете написати новий відгук нижче.</p>
                          <button onClick={handleDeleteReview} className="mt-2 text-sm text-red-500 hover:text-red-700">Видалити і написати заново</button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitReview} className="mb-10 p-6 bg-gray-50 rounded-2xl border border-gray-200">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Залишити відгук</h3>
                      {/* Star rating selector */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Оцінка</label>
                        <div className="flex gap-1">
                          {[1,2,3,4,5].map(s => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setReviewForm(f => ({ ...f, rating: s }))}
                              className={`text-3xl transition-colors ${s <= reviewForm.rating ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-300'}`}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                      </div>
                      {/* Comment */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Ваш відгук</label>
                        <textarea
                          value={reviewForm.comment}
                          onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                          placeholder="Поділіться враженнями про товар (мінімум 10 символів)..."
                          rows={4}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none text-sm"
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={submittingReview}
                        className="px-6 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors text-sm"
                      >
                        {submittingReview ? 'Надсилається...' : 'Надіслати відгук'}
                      </button>
                    </form>
                  )
                ) : (
                  <div className="mb-8 p-5 bg-blue-50 border border-blue-200 rounded-2xl text-center">
                    <p className="text-gray-700 mb-3">Увійдіть, щоб залишити відгук</p>
                    <button
                      onClick={() => navigate('/login')}
                      className="px-5 py-2 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors text-sm"
                    >
                      Увійти
                    </button>
                  </div>
                )}

                {/* Reviews list */}
                {reviewsLoading ? (
                  <div className="text-center py-8 text-gray-400">Завантаження...</div>
                ) : reviews.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-4xl mb-3">💬</p>
                    <p className="text-gray-500">Відгуків ще немає. Будьте першим!</p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {reviews.map(review => (
                      <div key={review.id} className="flex gap-4 p-5 bg-white border border-gray-100 rounded-2xl shadow-sm">
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 font-bold text-primary text-sm">
                          {(review.user_display || '?')[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span className="font-semibold text-gray-900 text-sm">{review.user_display}</span>
                            <span className="text-xs text-gray-400">
                              {new Date(review.created_at).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                          </div>
                          <div className="flex gap-0.5 mt-0.5">
                            {[1,2,3,4,5].map(s => (
                              <span key={s} className={`text-sm ${s <= review.rating ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
                            ))}
                          </div>
                          {review.title && <p className="font-medium text-gray-800 mt-1 text-sm">{review.title}</p>}
                          <p className="text-gray-600 mt-1 text-sm leading-relaxed">{review.comment}</p>
                          {review.is_verified_purchase && (
                            <span className="inline-block mt-2 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">✓ Підтверджена покупка</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Найчастіше купують</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;
