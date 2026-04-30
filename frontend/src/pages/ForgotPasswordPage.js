import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/users/password-reset/', { email });
      setSent(true);
    } catch {
      toast.error('Сталася помилка. Спробуйте ще раз.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-teal-500 px-8 py-12 text-center">
            <div className="text-5xl mb-3">🔑</div>
            <h1 className="text-2xl font-bold text-white mb-2">Забули пароль?</h1>
            <p className="text-green-100 text-sm">Введіть email — надішлемо посилання для відновлення</p>
          </div>

          <div className="px-8 py-8">
            {sent ? (
              <div className="text-center space-y-4">
                <div className="text-5xl">📧</div>
                <h2 className="text-xl font-semibold text-gray-800">Перевірте пошту</h2>
                <p className="text-gray-600 text-sm">
                  Якщо акаунт з адресою <strong>{email}</strong> існує, ви отримаєте лист з посиланням для відновлення пароля.
                </p>
                <p className="text-gray-400 text-xs">Не знайшли? Перевірте папку «Спам».</p>
                <Link
                  to="/login"
                  className="inline-block mt-4 text-green-600 hover:text-green-700 font-semibold text-sm transition-colors"
                >
                  ← Повернутися до входу
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-all"
                >
                  {loading ? 'Надсилання...' : 'Надіслати посилання'}
                </button>
                <div className="text-center">
                  <Link to="/login" className="text-sm text-gray-500 hover:text-green-600 transition-colors">
                    ← Повернутися до входу
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
