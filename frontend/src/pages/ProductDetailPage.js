import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import { useAuthStore, useCartStore } from '../store';


const ProductDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { setCart } = useCartStore();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('description');

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

  useEffect(() => {
    fetchProduct();
  }, [slug]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.info('Увійдіть, щоб додати товар до кошика');
      navigate('/login');
      return;
    }

    try {
      await api.post('/api/cart/add_item/', {
        product_id: product.id,
        quantity: quantity,
      });
      setCart(product);
      toast.success('Товар додано до кошика!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error(error.response?.data?.error || 'Помилка додавання до кошика');
    }
  };

  const incrementQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
      </div>
    );
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
                  {product.old_price && (
                    <span className="text-lg text-gray-400 line-through">
                      {Math.round(product.old_price)} грн
                    </span>
                  )}
                  <span className="text-4xl font-bold text-red-600">
                    {Math.round(product.final_price || product.price)} грн
                  </span>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center gap-4 mb-6">
                <span className="font-semibold text-gray-700">Кількість:</span>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button 
                    onClick={decrementQuantity}
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
                    disabled={quantity >= product.stock}
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
                Відгуки
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
              <div className="text-center py-12">
                <p className="text-gray-500">Відгуків ще немає</p>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Найчастіше купують</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-3xl shadow-sm overflow-hidden h-96">
                <div className="bg-gray-100 h-40"></div>
                <div className="p-4">
                  <p className="text-xs text-gray-500 mb-2">Помічник для вас</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
