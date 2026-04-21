import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';

const BillCard = ({ bill, actions }) => {
  const API_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

  return (
    <div className="bill-card">
      <div className="bill-card-header">
        <div>
          <h3 className="bill-card-name">{bill.employeeName}</h3>
          <span className="bill-card-id">ID: {bill.employeeId} · {bill.designation}</span>
        </div>
        <StatusBadge status={bill.status} />
      </div>

      <div className="bill-card-body">
        <div className="bill-meta-grid">
          <div className="bill-meta-item">
            <span className="meta-label">Amount</span>
            <span className="meta-value amount">₹{bill.amount?.toLocaleString('en-IN')}</span>
          </div>
          <div className="bill-meta-item">
            <span className="meta-label">Category</span>
            <span className="meta-value">{bill.category}</span>
          </div>
          <div className="bill-meta-item">
            <span className="meta-label">Bill Date</span>
            <span className="meta-value">{new Date(bill.billDate).toLocaleDateString()}</span>
          </div>
          <div className="bill-meta-item">
            <span className="meta-label">Submitted</span>
            <span className="meta-value">{new Date(bill.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        <p className="bill-description">{bill.description}</p>

        {bill.attachment?.filename && (
          <a
            href={`${API_URL}/uploads/${bill.attachment.filename}`}
            target="_blank"
            rel="noopener noreferrer"
            className="attachment-link"
          >
            📎 {bill.attachment.originalName}
          </a>
        )}
      </div>

      <div className="bill-card-footer">
        <Link to={`/bills/${bill._id}`} className="btn btn-outline btn-sm">
          View Details
        </Link>
        {actions && <div className="bill-actions">{actions}</div>}
      </div>
    </div>
  );
};

export default BillCard;
