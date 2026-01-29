import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const imageUrl = product.primary_image || '/placeholder.png';

  const handleAddToCart = (e) => {
    e.preventDefault();
    console.log('Add to cart:', product.id, quantity);
    // TODO: Implement cart functionality
  };

  const toggleWishlist = (e) => {
    e.preventDefault();
    setIsWishlisted(!isWishlisted);
  };

  const incrementQuantity = (e) => {
    e.preventDefault();
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = (e) => {
    e.preventDefault();
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  return (
    <div className="product-card">
      {/* Badges */}
      {product.is_featured && (
        <div className="card-badge card-badge-popular">Популярні</div>
      )}
      {product.is_new && (
        <div className="card-badge card-badge-new">Новинка</div>
      )}
      
      {/* Wishlist Button */}
      <button 
        className={`wishlist-heart ${isWishlisted ? 'active' : ''}`}
        onClick={toggleWishlist}
        aria-label="Add to wishlist"
      >
        ♥
      </button>

      <Link to={`/products/${product.slug}`} className="product-image-link">
        <div className="product-image-wrapper">
          <img src={imageUrl} alt={product.name} />
          <div className="watermark">🌿 Зелений куточок</div>
        </div>
      </Link>

      <div className="product-content">
        {/* Product Meta */}
        <div className="product-meta">
          <span className="product-code">Код товару: {product.sku || product.id}</span>
          <span className="product-reviews">
            ⭐ {product.average_rating || 5} ({product.reviews_count || 0} відгуків)
          </span>
          {product.planting_season && (
            <span className="product-season">✓ НА ВЕСНУ 2026</span>
          )}
        </div>

        {/* Product Title */}
        <Link to={`/products/${product.slug}`} className="product-title-link">
          <h3 className="product-title">{product.name}</h3>
        </Link>

        {/* Product Specs */}
        <div className="product-specs">
          {product.variety && (
            <div className="spec-item">
              <span className="spec-label">Сорт:</span>
              <span className="spec-value">{product.variety}</span>
            </div>
          )}
          {product.ripening_time && (
            <div className="spec-item">
              <span className="spec-label">Стиглість:</span>
              <span className="spec-value">{product.ripening_time}</span>
            </div>
          )}
          {product.fruit_weight && (
            <div className="spec-item">
              <span className="spec-label">Маса плоду:</span>
              <span className="spec-value">{product.fruit_weight}</span>
            </div>
          )}
          {product.age && (
            <div className="spec-item">
              <span className="spec-label">Вік саджанця:</span>
              <span className="spec-value">{product.age}</span>
            </div>
          )}
        </div>

        {/* Price */}
        <div className="product-price-section">
          {product.old_price && (
            <span className="price-old">{Math.round(product.old_price)} ГРН</span>
          )}
          <span className="price-current">{Math.round(product.final_price)} <span className="currency">ГРН</span></span>
        </div>

        {/* Package Options */}
        {product.package_type && (
          <div className="package-options">
            <button className="package-btn package-btn-primary">
              відкритий корінь
            </button>
            <button className="package-btn package-btn-secondary">
              в горшику 10л
            </button>
          </div>
        )}

        {/* Quantity and Add to Cart */}
        <div className="product-actions">
          <div className="quantity-controls">
            <button 
              className="qty-btn"
              onClick={decrementQuantity}
              disabled={quantity <= 1}
            >
              −
            </button>
            <input 
              type="number" 
              className="qty-input" 
              value={quantity}
              readOnly
            />
            <button 
              className="qty-btn"
              onClick={incrementQuantity}
              disabled={quantity >= product.stock}
            >
              +
            </button>
          </div>
          <button 
            className="add-to-cart-btn"
            onClick={handleAddToCart}
            disabled={!product.in_stock}
          >
            🛒 Купити
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
