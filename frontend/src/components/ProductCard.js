import React from 'react';
import { Link } from 'react-router-dom';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const imageUrl = product.primary_image || '/placeholder.png';

  return (
    <div className="product-card">
      <Link to={`/products/${product.slug}`} className="product-link">
        <div className="product-image">
          <img src={imageUrl} alt={product.name} />
          {product.is_new && <span className="badge badge-new">Новинка</span>}
          {product.discount_percentage > 0 && (
            <span className="badge badge-sale">-{product.discount_percentage}%</span>
          )}
        </div>

        <div className="product-info">
          <h3 className="product-name">{product.name}</h3>
          <p className="product-description">{product.short_description}</p>

          <div className="product-footer">
            <div className="product-price">
              {product.old_price && (
                <span className="old-price">{product.old_price} ₴</span>
              )}
              <span className="price">{product.final_price} ₴</span>
            </div>

            {product.in_stock ? (
              <span className="stock in-stock">В наявності</span>
            ) : (
              <span className="stock out-of-stock">Немає в наявності</span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
