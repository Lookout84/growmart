import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import { useAuthStore } from '../store';
import './LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/api/users/login/', formData);
      const { access, refresh } = response.data;

      // Get user profile
      const profileResponse = await api.get('/api/users/profile/', {
        headers: { Authorization: `Bearer ${access}` },
      });

      login(profileResponse.data, { access, refresh });
      toast.success('Ви успішно увійшли!');
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.detail || 'Невірний логін або пароль');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="container">
        <div className="auth-card">
          <h1>Вхід</h1>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Ім'я користувача або Email</label>
              <input
                type="text"
                name="username"
                className="form-control"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Пароль</label>
              <input
                type="password"
                name="password"
                className="form-control"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary btn-large" disabled={loading}>
              {loading ? 'Вхід...' : 'Увійти'}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Немає акаунту? <Link to="/register">Зареєструватися</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
