import React from 'react';

const Alert = ({ type = 'info', message, onClose }) => {
  if (!message) return null;

  const config = {
    success: { bg: '#d1fae5', border: '#059669', color: '#065f46', icon: '✅' },
    error: { bg: '#fee2e2', border: '#dc2626', color: '#991b1b', icon: '❌' },
    warning: { bg: '#fef3c7', border: '#d97706', color: '#92400e', icon: '⚠️' },
    info: { bg: '#dbeafe', border: '#2563eb', color: '#1e40af', icon: 'ℹ️' },
  };

  const c = config[type];

  return (
    <div
      className="alert"
      style={{
        background: c.bg,
        borderLeft: `4px solid ${c.border}`,
        color: c.color,
      }}
    >
      <span className="alert-icon">{c.icon}</span>
      <span className="alert-message">{message}</span>
      {onClose && (
        <button className="alert-close" onClick={onClose}>×</button>
      )}
    </div>
  );
};

export default Alert;
