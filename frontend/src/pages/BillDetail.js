import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBillById } from '../services/api';
import { useAuth } from '../components/AuthContext';
import StatusBadge from '../components/StatusBadge';
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';

const BillDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_URL = process.env.REACT_APP_API_URL|| 'http://localhost:5000/api';

  useEffect(() => {
    fetchBill();
  }, [id]);

  const fetchBill = async () => {
    try {
      const { data } = await getBillById(id);
      setBill(data.bill);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load bill details.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="page"><Spinner text="Loading bill details..." /></div>;
  if (error) return <div className="page"><Alert type="error" message={error} /></div>;
  if (!bill) return null;

  const timeline = [
    {
      stage: 'Submitted',
      done: true,
      date: bill.createdAt,
      by: bill.submittedBy?.name,
      icon: '📤',
      color: '#2563eb',
    },
    {
      stage: 'Manager Review',
      done: !!bill.managerAction,
      date: bill.managerApprovedAt,
      by: bill.managerApprovedBy?.name,
      result: bill.managerAction,
      remarks: bill.managerRemarks,
      icon: bill.managerAction === 'approved' ? '✅' : bill.managerAction === 'rejected' ? '❌' : '⏳',
      color: bill.managerAction === 'approved' ? '#059669' : bill.managerAction === 'rejected' ? '#dc2626' : '#d97706',
    },
    {
      stage: 'HOD Review',
      done: !!bill.hodAction,
      date: bill.hodApprovedAt,
      by: bill.hodApprovedBy?.name,
      result: bill.hodAction,
      remarks: bill.hodRemarks,
      icon: bill.hodAction === 'approved' ? '✅' : bill.hodAction === 'rejected' ? '❌' : '⏳',
      color: bill.hodAction === 'approved' ? '#059669' : bill.hodAction === 'rejected' ? '#dc2626' : '#d97706',
    },
    {
      stage: 'Final Status',
      done: bill.status === 'approved' || bill.status === 'rejected',
      icon: bill.status === 'approved' ? '🎉' : bill.status === 'rejected' ? '❌' : '⏳',
      color: bill.status === 'approved' ? '#059669' : bill.status === 'rejected' ? '#dc2626' : '#94a3b8',
    },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}>← Back</button>
          <h1 className="page-title" style={{ marginTop: 8 }}>Bill Details</h1>
        </div>
        <StatusBadge status={bill.status} />
      </div>

      <div className="detail-grid">
        {/* Left: Bill Info */}
        <div className="detail-main">
          <div className="detail-card">
            <h3 className="detail-section-title">Employee Information</h3>
            <div className="detail-rows">
              <div className="detail-row">
                <span className="detail-label">Full Name</span>
                <span className="detail-value">{bill.employeeName}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Employee ID</span>
                <span className="detail-value">{bill.employeeId}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Designation</span>
                <span className="detail-value">{bill.designation || '—'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Department</span>
                <span className="detail-value">{bill.department || '—'}</span>
              </div>
            </div>
          </div>

          <div className="detail-card">
            <h3 className="detail-section-title">Bill Information</h3>
            <div className="detail-rows">
              <div className="detail-row">
                <span className="detail-label">Amount</span>
                <span className="detail-value amount-large">₹{bill.amount?.toLocaleString('en-IN')}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Category</span>
                <span className="detail-value"><span className="category-tag">{bill.category}</span></span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Bill Date</span>
                <span className="detail-value">{new Date(bill.billDate).toLocaleDateString()}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Submitted On</span>
                <span className="detail-value">{new Date(bill.createdAt).toLocaleString()}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Description</span>
                <span className="detail-value">{bill.description}</span>
              </div>
            </div>
          </div>

          {bill.attachment?.filename && (
            <div className="detail-card">
              <h3 className="detail-section-title">Attachment</h3>
              <a
                href={`${API_URL}/uploads/${bill.attachment.filename}`}
                target="_blank"
                rel="noopener noreferrer"
                className="attachment-block"
              >
                <span className="attachment-icon">📎</span>
                <div>
                  <div className="attachment-name">{bill.attachment.originalName}</div>
                  <div className="attachment-size">
                    {(bill.attachment.size / 1024).toFixed(1)} KB · {bill.attachment.mimetype}
                  </div>
                </div>
                <span className="attachment-open">Open ↗</span>
              </a>
            </div>
          )}

          <div className="detail-card">
            <h3 className="detail-section-title">Approval Routing</h3>
            <div className="detail-rows">
              <div className="detail-row">
                <span className="detail-label">Manager Email</span>
                <span className="detail-value">{bill.managerEmail}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">HOD Email</span>
                <span className="detail-value">{bill.hodEmail}</span>
              </div>
            </div>
          </div>

          {bill.status === 'rejected' && (
            <div className="detail-card rejected-card">
              <h3 className="detail-section-title">Rejection Details</h3>
              <div className="detail-rows">
                <div className="detail-row">
                  <span className="detail-label">Rejected At Stage</span>
                  <span className="detail-value">{bill.rejectionStage}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Reason</span>
                  <span className="detail-value reject-reason">{bill.rejectionRemarks || 'No reason provided'}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Timeline */}
        <div className="detail-sidebar">
          <div className="detail-card">
            <h3 className="detail-section-title">Approval Timeline</h3>
            <div className="timeline">
              {timeline.map((step, i) => (
                <div key={i} className={`timeline-step ${step.done ? 'done' : 'pending'}`}>
                  <div className="timeline-icon" style={{ background: step.color + '20', color: step.color }}>
                    {step.icon}
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-stage">{step.stage}</div>
                    {step.result && (
                      <div className={`timeline-result ${step.result}`}>
                        {step.result === 'approved' ? 'Approved' : 'Rejected'}
                      </div>
                    )}
                    {step.by && <div className="timeline-by">by {step.by}</div>}
                    {step.date && (
                      <div className="timeline-date">{new Date(step.date).toLocaleDateString()}</div>
                    )}
                    {step.remarks && (
                      <div className="timeline-remarks">"{step.remarks}"</div>
                    )}
                    {!step.done && !step.result && (
                      <div className="timeline-waiting">Waiting...</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillDetail;
