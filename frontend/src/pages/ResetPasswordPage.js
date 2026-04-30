import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';

const ResetPasswordPage = () => {
  const { uid, token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Паролі не співпадають');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Пароль повинен містити не менше 8 символів');
      return;
    }
    setLoading(true);
    try {
      await api.post('/api/users/password-reset/confirm/', { uid, token, new_password: newPassword });
      setDone(true);
      toast.success('Пароль успішно змінено!');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Посилання недійсне або застаріло');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-teal-500 px-8 py-12 text-center">
            <div className="text-5xl mb-3">🔐</div>
            <h1 className="text-2xl font-bold text-white mb-2">Новий пароль</h1>
            <p className="text-green-100 text-sm">Введіть новий пароль для вашого акаунта</p>
          </div>

          <div className="px-8 py-8">
            {done ? (
              <div className="text-center space-y-4">
                <div className="text-5xl">✅</div>
                <h2 className="text-xl font-semibold text-gray-800">Пароль змінено!</h2>
                <p className="text-gray-600 text-sm">Зараз вас буде перенаправлено на сторінку входу...</p>
                <Link to="/login" className="inline-block mt-2 text-green-600 hover:text-green-700 font-semibold text-sm">
                  Увійти зараз →
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Новий пароль</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    placeholder="Мінімум 8 символів"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Підтвердіть пароль</label>
                  <input
                    type="password"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    placeholder="Повторіть пароль"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-all"
                >
                  {loading ? 'Збереження...' : 'Зберегти новий пароль'}
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

export default ResetPasswordPage;
