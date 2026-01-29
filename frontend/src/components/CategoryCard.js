import React from 'react';
import { Link } from 'react-router-dom';
import './CategoryCard.css';

const CategoryCard = ({ category }) => {
  return (
    <Link to={`/products?category=${category.slug}`} className="category-card">
      <div className="category-image">
        <img src={category.image || '/placeholder-category.jpg'} alt={category.name} />
      </div>
      <div className="category-info">
        <h3>{category.name}</h3>
      </div>
    </Link>
  );
};

export default CategoryCard;
