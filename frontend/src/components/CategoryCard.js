import React from 'react';
import { Link } from 'react-router-dom';

const CategoryCard = ({ category }) => {
  return (
    <Link 
      to={`/products?category=${category.id}`} 
      className="group overflow-hidden rounded-3xl shadow-md hover:shadow-xl transition-all duration-300 h-40 flex items-end bg-cover bg-center relative border border-gray-100"
      style={{backgroundImage: `url(${category.image || '/placeholder-category.jpg'})`}}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-all"></div>
      
      {/* Content */}
      <div className="relative w-full p-4 z-10">
        <h3 className="text-white font-bold text-lg text-center group-hover:text-teal-300 transition-colors">
          {category.name}
        </h3>
      </div>
    </Link>
  );
};

export default CategoryCard;
