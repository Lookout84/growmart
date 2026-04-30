import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

const StaticPage = () => {
  const { slug } = useParams();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    setPage(null);
    api.get(`/api/content/pages/${slug}/`)
      .then(({ data }) => setPage(data))
      .catch((err) => {
        if (err.response?.status === 404) setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (notFound || !page) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="text-6xl mb-2">🍃</div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Сторінку не знайдено</h1>
        <p className="text-gray-500 max-w-sm">Можливо, вона була переміщена або видалена.</p>
        <Link
          to="/"
          className="mt-2 px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium"
        >
          На головну
        </Link>
      </div>
    );
  }

  const formattedDate = page.updated_at
    ? new Date(page.updated_at).toLocaleDateString('uk-UA', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : null;

  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12 px-4">
      {/* Breadcrumb */}
      <nav className="max-w-3xl mx-auto mb-4 text-sm text-gray-400 flex items-center gap-1.5">
        <Link to="/" className="hover:text-primary transition-colors">Головна</Link>
        <span>/</span>
        <span className="text-gray-600 truncate">{page.title}</span>
      </nav>

      <article className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Page header */}
        <header className="px-6 sm:px-10 pt-8 sm:pt-10 pb-6 border-b border-gray-100">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-snug">
            {page.title}
          </h1>
          {formattedDate && (
            <p className="mt-2 text-sm text-gray-400">Оновлено: {formattedDate}</p>
          )}
        </header>

        {/* Page content */}
        <div
          className="page-content px-6 sm:px-10 py-8 sm:py-10"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />

        {/* Footer nav */}
        <div className="px-6 sm:px-10 pb-8 sm:pb-10 pt-2 border-t border-gray-100 flex items-center justify-between gap-4 flex-wrap">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors"
          >
            ← На головну
          </Link>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary-dark transition-colors font-medium"
          >
            До каталогу →
          </Link>
        </div>
      </article>
    </div>
  );
};

export default StaticPage;
