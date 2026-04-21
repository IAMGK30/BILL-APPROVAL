import React from 'react';

const statusConfig = {
  pending_manager: { label: 'Pending Manager', color: '#d97706', bg: '#fef3c7' },
  pending_hod: { label: 'Pending HOD', color: '#7c3aed', bg: '#ede9fe' },
  approved: { label: 'Approved', color: '#059669', bg: '#d1fae5' },
  rejected: { label: 'Rejected', color: '#dc2626', bg: '#fee2e2' },
};

const StatusBadge = ({ status }) => {
  const config = statusConfig[status] || { label: status, color: '#64748b', bg: '#f1f5f9' };
  return (
    <span
      className="status-badge"
      style={{ color: config.color, background: config.bg, border: `1px solid ${config.color}30` }}
    >
      {config.label}
    </span>
  );
};

export default StatusBadge;
