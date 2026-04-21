import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAccountsBills } from '../services/api';
import { useAuth } from '../components/AuthContext';
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';

const AccountsDashboard = () => {
  const { user } = useAuth();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      const { data } = await getAccountsBills();
      setBills(data.bills || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load bills.');
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = bills.reduce((sum, b) => sum + (b.amount || 0), 0);
  const categories = [...new Set(bills.map((b) => b.category))];

  const filtered = bills.filter(
    (b) =>
      b.employeeName?.toLowerCase().includes(search.toLowerCase()) ||
      b.employeeId?.toLowerCase().includes(search.toLowerCase()) ||
      b.category?.toLowerCase().includes(search.toLowerCase())
  );

  const API_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Accounts Dashboard</h1>
          <p className="page-subtitle">All fully approved bills ready for payment processing.</p>
        </div>
      </div>

      {error && <Alert type="error" message={error} />}

      <div className="stats-grid">
        <div className="stat-card" style={{ borderTop: '3px solid #059669' }}>
          <div className="stat-icon">✅</div>
          <div className="stat-value" style={{ color: '#059669' }}>{bills.length}</div>
          <div className="stat-label">Approved Bills</div>
        </div>
        <div className="stat-card" style={{ borderTop: '3px solid #0891b2' }}>
          <div className="stat-icon">💰</div>
          <div className="stat-value" style={{ color: '#0891b2' }}>
            ₹{totalAmount.toLocaleString('en-IN')}
          </div>
          <div className="stat-label">Total Payable</div>
        </div>
        <div className="stat-card" style={{ borderTop: '3px solid #7c3aed' }}>
          <div className="stat-icon">📂</div>
          <div className="stat-value" style={{ color: '#7c3aed' }}>{categories.length}</div>
          <div className="stat-label">Categories</div>
        </div>
        <div className="stat-card" style={{ borderTop: '3px solid #d97706' }}>
          <div className="stat-icon">👤</div>
          <div className="stat-value" style={{ color: '#d97706' }}>
            {new Set(bills.map((b) => b.employeeId)).size}
          </div>
          <div className="stat-label">Unique Employees</div>
        </div>
      </div>

      <div className="section">
        <div className="section-header">
          <h2 className="section-title">Approved Bills</h2>
          <input
            type="text"
            className="search-input"
            placeholder="Search by name, ID, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <Spinner text="Loading approved bills..." />
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>{search ? 'No results found' : 'No approved bills yet'}</h3>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Employee</th>
                  <th>ID</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>HOD Approved</th>
                  <th>Attachment</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((bill, i) => (
                  <tr key={bill._id}>
                    <td className="td-index">{i + 1}</td>
                    <td>
                      <div className="td-name">{bill.employeeName}</div>
                      <div className="td-sub">{bill.designation}</div>
                    </td>
                    <td>{bill.employeeId}</td>
                    <td><span className="category-tag">{bill.category}</span></td>
                    <td className="td-truncate">{bill.description}</td>
                    <td className="td-amount approved-amount">
                      ₹{bill.amount?.toLocaleString('en-IN')}
                    </td>
                    <td>
                      {bill.hodApprovedAt
                        ? new Date(bill.hodApprovedAt).toLocaleDateString()
                        : '—'}
                    </td>
                    <td>
                      {bill.attachment?.filename ? (
                        <a
                          href={`${API_URL}/uploads/${bill.attachment.filename}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="table-link"
                        >
                          📎 View
                        </a>
                      ) : (
                        <span className="td-muted">None</span>
                      )}
                    </td>
                    <td>
                      <Link to={`/bills/${bill._id}`} className="table-link">View →</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="table-total">
                  <td colSpan={5} style={{ textAlign: 'right', fontWeight: 600 }}>Total Payable:</td>
                  <td className="td-amount approved-amount" style={{ fontWeight: 700 }}>
                    ₹{filtered.reduce((s, b) => s + (b.amount || 0), 0).toLocaleString('en-IN')}
                  </td>
                  <td colSpan={3}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountsDashboard;
