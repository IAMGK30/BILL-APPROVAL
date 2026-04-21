import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';

const roleDashboards = {
  employee: '/employee/dashboard',
  manager: '/manager/dashboard',
  hod: '/hod/dashboard',
  accounts: '/accounts/dashboard',
};

const Unauthorized = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="error-page">
      <div className="error-card">
        <div className="error-icon">🚫</div>
        <h1 className="error-title">Access Denied</h1>
        <p className="error-message">
          You don't have permission to view this page.
        </p>
        <button
          className="btn btn-primary"
          onClick={() => navigate(user ? roleDashboards[user.role] || '/' : '/login')}
        >
          Go to My Dashboard
        </button>
      </div>
    </div>
  );
};

export default Unauthorized;
