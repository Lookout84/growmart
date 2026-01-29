import React from 'react';
import './Banner.css';

const Banner = ({ banner }) => {
  return (
    <div className="banner" style={{ backgroundImage: `url(${banner.image})` }}>
      <div className="banner-content">
        <h2 className="banner-title">{banner.title}</h2>
        {banner.subtitle && <p className="banner-subtitle">{banner.subtitle}</p>}
        {banner.description && <p className="banner-description">{banner.description}</p>}
        {banner.button_text && banner.link && (
          <a href={banner.link} className="banner-button">
            {banner.button_text}
          </a>
        )}
      </div>
    </div>
  );
};

export default Banner;
