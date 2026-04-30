import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuthStore } from '../store/index';

// ── Star components ──────────────────────────────────────────────────────────

const StarIcon = ({ filled, half = false, size = 'md' }) => {
  const sz = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-7 h-7' : 'w-5 h-5';
  if (half) {
    return (
      <svg className={sz} viewBox="0 0 24 24">
        <defs>
          <linearGradient id="half">
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="50%" stopColor="#e5e7eb" />
          </linearGradient>
        </defs>
        <path fill="url(#half)" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    );
  }
  return (
    <svg className={sz} viewBox="0 0 24 24" fill={filled ? '#f59e0b' : '#e5e7eb'}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
};

const StarRating = ({ value, size = 'md' }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    const diff = value - (i - 1);
    stars.push(
      <StarIcon key={i} filled={diff >= 1} half={diff > 0 && diff < 1} size={size} />
    );
  }
  return <span className="inline-flex items-center gap-0.5">{stars}</span>;
};

const InteractiveStar = ({ index, current, hovered, onHover, onLeave, onClick }) => {
  const active = index <= (hovered || current);
  return (
    <button
      type="button"
      onMouseEnter={() => onHover(index)}
      onMouseLeave={onLeave}
      onClick={() => onClick(index)}
      className="focus:outline-none transition-transform hover:scale-110"
      aria-label={`${index} зірок`}
    >
      <svg className="w-8 h-8 sm:w-10 sm:h-10" viewBox="0 0 24 24" fill={active ? '#f59e0b' : '#e5e7eb'}>
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    </button>
  );
};

// ── Rating bar ───────────────────────────────────────────────────────────────
const RatingBar = ({ star, count, total }) => {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-3 text-gray-500 shrink-0">{star}</span>
      <StarIcon filled size="sm" />
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-2 bg-amber-400 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-6 text-right text-gray-400 shrink-0">{count}</span>
    </div>
  );
};

// ── Review card ──────────────────────────────────────────────────────────────
const ReviewCard = ({ review }) => {
  const initials = review.author
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');

  const date = new Date(review.created_at).toLocaleDateString('uk-UA', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  const colors = [
    'bg-green-500', 'bg-blue-500', 'bg-purple-500',
    'bg-rose-500', 'bg-amber-500', 'bg-teal-500',
  ];
  const color = colors[review.id % colors.length];

  return (
    <article className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`${color} w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0`}>
            {initials || '?'}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 truncate">{review.author}</p>
            <p className="text-xs text-gray-400">{date}</p>
          </div>
        </div>
        <StarRating value={review.rating} size="sm" />
      </div>

      {review.title && (
        <h3 className="font-semibold text-gray-800 text-sm leading-snug">{review.title}</h3>
      )}
      <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>

      {review.rating === 5 && (
        <span className="self-start inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
          ✓ Рекомендує
        </span>
      )}
    </article>
  );
};

// ── Main page ────────────────────────────────────────────────────────────────
const ReviewsPage = () => {
  const { isAuthenticated } = useAuthStore();

  const [reviews, setReviews]         = useState([]);
  const [stats, setStats]             = useState({ avg_rating: 0, total: 0, distribution: {} });
  const [loading, setLoading]         = useState(true);
  const [myReview, setMyReview]       = useState(null);   // null = loading, false = none
  const [myReviewLoaded, setMyReviewLoaded] = useState(false);

  // form
  const [rating, setRating]   = useState(0);
  const [hovered, setHovered] = useState(0);
  const [title, setTitle]     = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formMsg, setFormMsg] = useState(null);  // { type: 'success'|'error', text }

  const fetchReviews = useCallback(() => {
    setLoading(true);
    api.get('/api/content/reviews/')
      .then(({ data }) => {
        setReviews(data.reviews);
        setStats({ avg_rating: data.avg_rating, total: data.total, distribution: data.distribution });
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  useEffect(() => {
    if (!isAuthenticated) { setMyReview(false); setMyReviewLoaded(true); return; }
    api.get('/api/content/reviews/my/')
      .then(({ data }) => { setMyReview(data || false); })
      .catch(() => { setMyReview(false); })
      .finally(() => setMyReviewLoaded(true));
  }, [isAuthenticated]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) { setFormMsg({ type: 'error', text: 'Будь ласка, оберіть оцінку.' }); return; }
    if (comment.trim().length < 10) { setFormMsg({ type: 'error', text: 'Відгук має бути не менше 10 символів.' }); return; }
    setSubmitting(true);
    setFormMsg(null);
    try {
      await api.post('/api/content/reviews/', { rating, title: title.trim(), comment: comment.trim() });
      setFormMsg({ type: 'success', text: 'Дякуємо! Ваш відгук відправлено на модерацію.' });
      setMyReview({ status: 'pending', rating, title, comment });
      setRating(0); setTitle(''); setComment('');
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.comment?.[0] || 'Помилка. Спробуйте ще раз.';
      setFormMsg({ type: 'error', text: msg });
    } finally {
      setSubmitting(false);
    }
  };

  const avgDisplay = stats.avg_rating ? stats.avg_rating.toFixed(1) : '—';

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-primary-dark via-green-800 to-green-600 text-white">
        <div className="max-w-5xl mx-auto px-4 py-14 sm:py-20 text-center">
          <p className="text-green-200 text-sm font-medium uppercase tracking-widest mb-3">Відгуки клієнтів</p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
            Що кажуть про нас
          </h1>
          <p className="text-green-100 text-base sm:text-lg max-w-xl mx-auto">
            Реальні відгуки від наших покупців. Ваша думка важлива для нас!
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-10 sm:py-14 space-y-12">

        {/* ── Stats strip ── */}
        {stats.total > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center gap-8">
              {/* Big score */}
              <div className="text-center shrink-0">
                <p className="text-6xl font-extrabold text-gray-900 leading-none">{avgDisplay}</p>
                <StarRating value={stats.avg_rating} size="lg" />
                <p className="text-sm text-gray-400 mt-1">{stats.total} відгук{stats.total === 1 ? '' : stats.total < 5 ? 'и' : 'ів'}</p>
              </div>

              {/* Bars */}
              <div className="flex-1 w-full space-y-2">
                {[5, 4, 3, 2, 1].map((s) => (
                  <RatingBar key={s} star={s} count={stats.distribution[s] || 0} total={stats.total} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Review form / status ── */}
        <section id="leave-review">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-5">Залишити відгук</h2>

          {!isAuthenticated && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
              <p className="text-2xl mb-2">🌱</p>
              <p className="text-gray-700 mb-4">Щоб залишити відгук, потрібно увійти в обліковий запис.</p>
              <div className="flex justify-center gap-3 flex-wrap">
                <Link to="/login" className="px-5 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors">
                  Увійти
                </Link>
                <Link to="/register" className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:border-primary hover:text-primary transition-colors">
                  Зареєструватись
                </Link>
              </div>
            </div>
          )}

          {isAuthenticated && myReviewLoaded && myReview && (
            <div className={`rounded-2xl p-6 border ${
              myReview.status === 'approved'
                ? 'bg-green-50 border-green-200'
                : myReview.status === 'rejected'
                ? 'bg-red-50 border-red-200'
                : 'bg-amber-50 border-amber-200'
            }`}>
              <div className="flex items-start gap-3">
                <span className="text-2xl mt-0.5">
                  {myReview.status === 'approved' ? '✅' : myReview.status === 'rejected' ? '❌' : '⏳'}
                </span>
                <div>
                  <p className="font-semibold text-gray-800">
                    {myReview.status === 'approved' && 'Ваш відгук опубліковано'}
                    {myReview.status === 'rejected' && 'Ваш відгук відхилено модератором'}
                    {myReview.status === 'pending' && 'Ваш відгук на модерації'}
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {myReview.status === 'pending' && 'Зазвичай перевірка займає до 24 годин.'}
                    {myReview.status === 'approved' && 'Дякуємо, що поділились своєю думкою!'}
                    {myReview.status === 'rejected' && 'Зверніться до підтримки, якщо вважаєте, що сталась помилка.'}
                  </p>
                  {myReview.comment && (
                    <p className="text-sm text-gray-600 mt-2 italic">«{myReview.comment}»</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {isAuthenticated && myReviewLoaded && !myReview && (
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6">
              {/* Star picker */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ваша оцінка <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <InteractiveStar
                      key={i}
                      index={i}
                      current={rating}
                      hovered={hovered}
                      onHover={setHovered}
                      onLeave={() => setHovered(0)}
                      onClick={setRating}
                    />
                  ))}
                </div>
                {rating > 0 && (
                  <p className="text-xs text-amber-600 mt-1">
                    {['', 'Дуже погано', 'Погано', 'Нормально', 'Добре', 'Відмінно'][rating]}
                  </p>
                )}
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Заголовок <span className="text-gray-400 text-xs">(необов'язково)</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={200}
                  placeholder="Коротко підсумуйте свій досвід"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                />
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Відгук <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={5}
                  minLength={10}
                  placeholder="Розкажіть про якість товарів, доставку, обслуговування…"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition resize-none"
                />
                <p className="text-xs text-gray-400 mt-1">{comment.length} символів (мін. 10)</p>
              </div>

              {/* Form message */}
              {formMsg && (
                <div className={`rounded-xl px-4 py-3 text-sm font-medium ${
                  formMsg.type === 'success'
                    ? 'bg-green-50 text-green-800 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {formMsg.text}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto px-8 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? 'Відправлення…' : 'Надіслати відгук'}
              </button>
            </form>
          )}
        </section>

        {/* ── Reviews list ── */}
        <section>
          <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              Відгуки {stats.total > 0 && <span className="text-gray-400 text-lg">({stats.total})</span>}
            </h2>
          </div>

          {loading && (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
            </div>
          )}

          {!loading && reviews.length === 0 && (
            <div className="text-center py-20 text-gray-400">
              <p className="text-5xl mb-4">🌿</p>
              <p className="text-lg font-medium">Поки що відгуків немає</p>
              <p className="text-sm mt-1">Будьте першим, хто поділиться своїм враженням!</p>
            </div>
          )}

          {!loading && reviews.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {reviews.map((r) => (
                <ReviewCard key={r.id} review={r} />
              ))}
            </div>
          )}
        </section>

        {/* ── CTA strip ── */}
        <div className="bg-gradient-to-r from-primary-dark to-green-600 rounded-2xl p-6 sm:p-8 text-white text-center">
          <h3 className="text-lg sm:text-xl font-bold mb-2">Вже купували у нас?</h3>
          <p className="text-green-100 text-sm mb-5">Поділіться своїм досвідом — це допоможе іншим покупцям!</p>
          {isAuthenticated ? (
            <a
              href="#leave-review"
              className="inline-block px-6 py-2.5 bg-white text-primary-dark font-semibold rounded-xl hover:bg-green-50 transition-colors"
            >
              Написати відгук
            </a>
          ) : (
            <Link
              to="/login"
              className="inline-block px-6 py-2.5 bg-white text-primary-dark font-semibold rounded-xl hover:bg-green-50 transition-colors"
            >
              Увійти та написати відгук
            </Link>
          )}
        </div>

      </div>
    </div>
  );
};

export default ReviewsPage;
