import React, { useState } from 'react';

const ActionModal = ({ isOpen, onClose, onConfirm, action, billName, loading }) => {
  const [remarks, setRemarks] = useState('');

  if (!isOpen) return null;

  const isReject = action === 'rejected';

  const handleSubmit = () => {
    if (isReject && !remarks.trim()) {
      alert('Please provide a reason for rejection.');
      return;
    }
    onConfirm(action, remarks);
    setRemarks('');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{isReject ? '❌ Reject Bill' : '✅ Approve Bill'}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <p>
            You are about to <strong>{isReject ? 'reject' : 'approve'}</strong> the bill
            submitted by <strong>{billName}</strong>.
          </p>
          <div className="form-group">
            <label className="form-label">
              Remarks {isReject && <span className="required">*</span>}
            </label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder={
                isReject
                  ? 'Please provide a reason for rejection...'
                  : 'Optional remarks...'
              }
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button
            className={`btn ${isReject ? 'btn-danger' : 'btn-success'}`}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Processing...' : isReject ? 'Reject Bill' : 'Approve Bill'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActionModal;
