import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';

const PopularCarousel = ({ products: rawProducts, title = 'Популярні саджанці', linkTo = '/products', bgColor = 'bg-gray-50' }) => {
  const products = rawProducts.slice(0, 8);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(4);

  useEffect(() => {
    const updateVisible = () => {
      if (window.innerWidth >= 1024) setVisibleCount(4);
      else if (window.innerWidth >= 768) setVisibleCount(2);
      else setVisibleCount(1);
    };
    updateVisible();
    window.addEventListener('resize', updateVisible);
    return () => window.removeEventListener('resize', updateVisible);
  }, []);

  const maxIndex = Math.max(0, products.length - visibleCount);

  useEffect(() => {
    setCurrentIndex(0);
  }, [visibleCount]);

  useEffect(() => {
    if (products.length <= visibleCount) return;
    const timer = setInterval(() => {
      setCurrentIndex(i => (i >= maxIndex ? 0 : i + 1));
    }, 4000);
    return () => clearInterval(timer);
  }, [maxIndex, products.length, visibleCount]);

  const prev = () => setCurrentIndex(i => Math.max(0, i - 1));
  const next = () => setCurrentIndex(i => Math.min(maxIndex, i + 1));

  const cardWidth = 100 / visibleCount;
  const translatePercent = currentIndex * cardWidth;

  if (!products.length) return null;

  return (
    <section className={`py-16 ${bgColor}`}>
      <div className="container">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl font-bold text-primary">{title}</h2>
          <Link
            to={linkTo}
            className="text-primary font-semibold hover:underline text-sm"
          >
            Переглянути всі →
          </Link>
        </div>

        <div className="relative">
          {/* Prev Button */}
          <button
            onClick={prev}
            disabled={currentIndex === 0}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-5 z-10 w-11 h-11 bg-white rounded-full shadow-lg flex items-center justify-center border border-gray-200 text-gray-500 hover:text-primary hover:border-primary hover:shadow-xl transition-all duration-200 disabled:opacity-30 disabled:cursor-default"
            aria-label="Попередній"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><polyline points="15 18 9 12 15 6" /></svg>
          </button>

          {/* Track */}
          <div className="overflow-hidden">
            <div
              className="flex w-full transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${translatePercent}%)` }}
            >
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex-shrink-0 px-3"
                  style={{ width: `${cardWidth}%` }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>

          {/* Next Button */}
          <button
            onClick={next}
            disabled={currentIndex >= maxIndex}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-5 z-10 w-11 h-11 bg-white rounded-full shadow-lg flex items-center justify-center border border-gray-200 text-gray-500 hover:text-primary hover:border-primary hover:shadow-xl transition-all duration-200 disabled:opacity-30 disabled:cursor-default"
            aria-label="Наступний"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><polyline points="9 18 15 12 9 6" /></svg>
          </button>
        </div>

        {/* Dots */}
        {products.length > visibleCount && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: maxIndex + 1 }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === currentIndex
                    ? 'w-6 bg-primary'
                    : 'w-2 bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Слайд ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default PopularCarousel;
