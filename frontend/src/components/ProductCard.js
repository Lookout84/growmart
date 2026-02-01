import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const imageUrl = product.primary_image || '/placeholder.png';

  const handleAddToCart = (e) => {
    e.preventDefault();
    console.log('Add to cart:', product.id);
    // TODO: Implement cart functionality
  };

  const toggleWishlist = (e) => {
    e.preventDefault();
    setIsWishlisted(!isWishlisted);
  };

  const rating = product.average_rating || 5;
  const reviewCount = product.reviews_count || 0;

  return (
    <Link 
      to={`/products/${product.slug}`} 
      className="group block bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 h-full flex flex-col border border-gray-100 hover:border-gray-200"
    >
      {/* Image Container */}
      <div className="relative overflow-hidden bg-gray-100 aspect-square">
        {/* Image */}
        <img 
          src={imageUrl} 
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Wishlist Button - Top Right */}
        <button 
          className={`absolute top-4 right-4 text-2xl z-20 transition-all drop-shadow-lg hover:scale-110 ${
            isWishlisted ? 'text-red-500' : 'text-gray-300 hover:text-red-500'
          }`}
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(e);
          }}
        >
          ♥
        </button>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col gap-3 flex-1">
        {/* Product Code */}
        <p className="text-xs text-gray-500 font-medium tracking-wide">
          Код товара: {product.sku || product.id}
        </p>

        {/* Title - maksimalno 3 reda */}
        <h3 className="font-semibold text-gray-800 text-sm line-clamp-3 leading-tight min-h-12">
          {product.name}
        </h3>

        {/* Rating and Reviews */}
        <div className="flex items-center gap-2">
          {/* Stars */}
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <span 
                key={i}
                className={`text-sm ${
                  i < Math.floor(rating) ? 'text-orange-400' : 'text-gray-300'
                }`}
              >
                ★
              </span>
            ))}
          </div>
          {/* Review Count */}
          <p className="text-xs text-gray-500">
            💬 {reviewCount} відгуків
          </p>
        </div>

        {/* Price Section */}
        <div className="flex items-baseline gap-2.5 mt-auto">
          {product.old_price && (
            <span className="text-sm text-gray-400 line-through font-medium">
              {Math.round(product.old_price)} грн
            </span>
          )}
          <span className="text-xl font-bold text-red-600">
            {Math.round(product.final_price || product.price)} грн
          </span>
        </div>

        {/* Add to Cart Button */}
        <button 
          onClick={(e) => {
            e.preventDefault();
            handleAddToCart(e);
          }}
          disabled={!product.in_stock}
          className="w-full bg-teal-500 hover:bg-teal-600 disabled:bg-gray-300 text-white rounded-2xl py-3 font-bold text-sm transition-all duration-300 hover:shadow-lg hover:scale-105 disabled:cursor-not-allowed disabled:scale-100"
        >
          🛒 Купити
        </button>
      </div>
    </Link>
  );
};

export default ProductCard;
