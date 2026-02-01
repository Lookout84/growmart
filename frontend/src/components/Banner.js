import React from 'react';

const Banner = ({ banner }) => {
  return (
    <div 
      className="relative w-full h-96 bg-cover bg-center rounded-lg overflow-hidden shadow-lg"
      style={{ backgroundImage: `url(${banner.image})` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40"></div>
      
      {/* Content */}
      <div className="relative flex flex-col items-center justify-center h-full text-center text-white px-4 z-10">
        <h2 className="text-4xl md:text-5xl font-bold mb-4">{banner.title}</h2>
        {banner.subtitle && (
          <p className="text-xl md:text-2xl mb-4 text-gray-100">{banner.subtitle}</p>
        )}
        {banner.description && (
          <p className="text-base md:text-lg mb-6 max-w-2xl text-gray-200">{banner.description}</p>
        )}
        {banner.button_text && banner.link && (
          <a 
            href={banner.link}
            className="btn-primary inline-block"
          >
            {banner.button_text}
          </a>
        )}
      </div>
    </div>
  );
};

export default Banner;
