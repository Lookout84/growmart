import React from 'react';
import { useAuthStore } from '../store';
import { Navigate } from 'react-router-dom';
import './ProfilePage.css';

const ProfilePage = () => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="profile-page">
      <div className="container">
        <h1>Мій профіль</h1>

        <div className="profile-card">
          <div className="profile-header">
            {user.avatar ? (
              <img src={user.avatar} alt={user.username} className="profile-avatar" />
            ) : (
              <div className="profile-avatar-placeholder">
                {user.first_name?.[0] || user.username[0]}
              </div>
            )}
            <h2>{user.first_name} {user.last_name || user.username}</h2>
          </div>

          <div className="profile-info">
            <div className="info-row">
              <span className="info-label">Ім'я користувача:</span>
              <span className="info-value">{user.username}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Email:</span>
              <span className="info-value">{user.email}</span>
            </div>
            {user.phone && (
              <div className="info-row">
                <span className="info-label">Телефон:</span>
                <span className="info-value">{user.phone}</span>
              </div>
            )}
            {user.address && (
              <div className="info-row">
                <span className="info-label">Адреса:</span>
                <span className="info-value">
                  {user.address}, {user.city}, {user.postal_code}
                </span>
              </div>
            )}
            <div className="info-row">
              <span className="info-label">Дата реєстрації:</span>
              <span className="info-value">
                {new Date(user.created_at).toLocaleDateString('uk-UA')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
