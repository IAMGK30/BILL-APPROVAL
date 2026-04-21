import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getHodBills, getAllBills } from '../services/api';
import { useAuth } from '../components/AuthContext';
import StatusBadge from '../components/StatusBadge';
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';

const HodDashboard = () => {
  const { user } = useAuth();
  const [pendingBills, setPendingBills] = useState([]);
  const [allBills, setAllBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pendRes, allRes] = await Promise.all([
        getHodBills(),
        getAllBills(),
      ]);
      setPendingBills(pendRes.data.bills || []);
      setAllBills(allRes.data.bills || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load data.');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Pending Your Approval', value: pendingBills.length, color: '#7c3aed', icon: '⏳' },
    { label: 'Fully Approved', value: allBills.filter(b => b.status === 'approved').length, color: '#059669', icon: '✅' },
    { label: 'Rejected', value: allBills.filter(b => b.status === 'rejected').length, color: '#dc2626', icon: '❌' },
    {
      label: 'Total Approved Value',
      value: `₹${allBills.filter(b => b.status === 'approved').reduce((s, b) => s + (b.amount || 0), 0).toLocaleString('en-IN')}`,
      color: '#0891b2',
      icon: '💰',
    },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">HOD Dashboard</h1>
          <p className="page-subtitle">Welcome, {user?.name}. Final approval authority for bills.</p>
        </div>
      </div>

      {error && <Alert type="error" message={error} />}

      <div className="stats-grid">
        {statCards.map((card) => (
          <div className="stat-card" key={card.label} style={{ borderTop: `3px solid ${card.color}` }}>
            <div className="stat-icon">{card.icon}</div>
            <div className="stat-value" style={{ color: card.color }}>{card.value}</div>
            <div className="stat-label">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="section">
        <div className="section-header">
          <h2 className="section-title">
            Manager-Approved Bills (Awaiting HOD)
            {pendingBills.length > 0 && (
              <span className="badge-count">{pendingBills.length}</span>
            )}
          </h2>
          <Link to="/hod/bills" className="btn btn-primary btn-sm">Review All →</Link>
        </div>

        {loading ? (
          <Spinner text="Loading bills..." />
        ) : pendingBills.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎉</div>
            <h3>All caught up!</h3>
            <p>No bills are pending your approval right now.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Manager Approved</th>
                  <th>Remarks</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingBills.slice(0, 5).map((bill) => (
                  <tr key={bill._id}>
                    <td>
                      <div className="td-name">{bill.employeeName}</div>
                      <div className="td-sub">{bill.designation}</div>
                    </td>
                    <td><span className="category-tag">{bill.category}</span></td>
                    <td className="td-amount">₹{bill.amount?.toLocaleString('en-IN')}</td>
                    <td>{bill.managerApprovedAt ? new Date(bill.managerApprovedAt).toLocaleDateString() : '—'}</td>
                    <td className="td-truncate">{bill.managerRemarks || '—'}</td>
                    <td>
                      <Link to="/hod/bills" className="btn btn-primary btn-sm">Review</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="section">
        <div className="section-header">
          <h2 className="section-title">All Bills Overview</h2>
        </div>
        {loading ? <Spinner /> : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Amount</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {allBills.slice(0, 8).map((bill) => (
                  <tr key={bill._id}>
                    <td>{bill.employeeName}</td>
                    <td className="td-amount">₹{bill.amount?.toLocaleString('en-IN')}</td>
                    <td><span className="category-tag">{bill.category}</span></td>
                    <td><StatusBadge status={bill.status} /></td>
                    <td><Link to={`/bills/${bill._id}`} className="table-link">View →</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default HodDashboard;
