import React from 'react';

const PageLoader = ({ fullScreen = true }) => {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-5 ${
        fullScreen ? 'min-h-screen bg-gray-50' : 'py-24'
      }`}
    >
      {/* Leaf spinner */}
      <div className="relative w-16 h-16">
        {/* Outer ring */}
        <div
          className="absolute inset-0 rounded-full border-4 border-green-100"
          style={{ borderTopColor: '#16a34a', animation: 'spin 1s linear infinite' }}
        />
        {/* Middle ring */}
        <div
          className="absolute inset-2 rounded-full border-4 border-green-100"
          style={{ borderTopColor: '#4ade80', animation: 'spin 0.75s linear infinite reverse' }}
        />
        {/* Leaf icon in center */}
        <div className="absolute inset-0 flex items-center justify-center text-2xl select-none">
          🌱
        </div>
      </div>
      <p className="text-green-700 font-semibold tracking-wide text-sm animate-pulse">
        Завантаження…
      </p>
    </div>
  );
};

export default PageLoader;
