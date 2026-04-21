import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyBills } from '../services/api';
import { useAuth } from '../components/AuthContext';
import StatusBadge from '../components/StatusBadge';
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';

const statuses = ['pending_manager', 'pending_hod', 'approved', 'rejected'];

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      const { data } = await getMyBills();
      setBills(data.bills || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load bills.');
    } finally {
      setLoading(false);
    }
  };

  const counts = statuses.reduce((acc, s) => {
    acc[s] = bills.filter((b) => b.status === s).length;
    return acc;
  }, {});

  const statCards = [
    { label: 'Total Submitted', value: bills.length, color: '#2563eb', icon: '📄' },
    { label: 'Pending Manager', value: counts.pending_manager, color: '#d97706', icon: '⏳' },
    { label: 'Pending HOD', value: counts.pending_hod, color: '#7c3aed', icon: '🔄' },
    { label: 'Approved', value: counts.approved, color: '#059669', icon: '✅' },
    { label: 'Rejected', value: counts.rejected, color: '#dc2626', icon: '❌' },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome back, {user?.name}! 👋</h1>
          <p className="page-subtitle">Here's an overview of your bill submissions.</p>
        </div>
        <Link to="/employee/submit" className="btn btn-primary">
          + Submit New Bill
        </Link>
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
          <h2 className="section-title">Recent Bills</h2>
          <Link to="/employee/bills" className="btn btn-outline btn-sm">View All</Link>
        </div>

        {loading ? (
          <Spinner text="Loading bills..." />
        ) : bills.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No bills yet</h3>
            <p>Submit your first bill to get started.</p>
            <Link to="/employee/submit" className="btn btn-primary">Submit a Bill</Link>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Bill Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {bills.slice(0, 5).map((bill) => (
                  <tr key={bill._id}>
                    <td className="td-truncate">{bill.description}</td>
                    <td><span className="category-tag">{bill.category}</span></td>
                    <td className="td-amount">₹{bill.amount?.toLocaleString('en-IN')}</td>
                    <td>{new Date(bill.billDate).toLocaleDateString()}</td>
                    <td><StatusBadge status={bill.status} /></td>
                    <td>
                      <Link to={`/bills/${bill._id}`} className="table-link">
                        View →
                      </Link>
                    </td>
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

export default EmployeeDashboard;
