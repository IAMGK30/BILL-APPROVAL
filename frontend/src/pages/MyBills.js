import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyBills } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';

const FILTER_OPTIONS = [
  { label: 'All', value: '' },
  { label: 'Pending Manager', value: 'pending_manager' },
  { label: 'Pending HOD', value: 'pending_hod' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
];

const MyBills = () => {
  const [bills, setBills] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchBills();
  }, []);

  useEffect(() => {
    if (statusFilter) {
      setFiltered(bills.filter((b) => b.status === statusFilter));
    } else {
      setFiltered(bills);
    }
  }, [statusFilter, bills]);

  const fetchBills = async () => {
    try {
      const { data } = await getMyBills();
      setBills(data.bills || []);
      setFiltered(data.bills || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load bills.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Bills</h1>
          <p className="page-subtitle">Track all your submitted reimbursement requests.</p>
        </div>
        <Link to="/employee/submit" className="btn btn-primary">+ Submit New</Link>
      </div>

      {error && <Alert type="error" message={error} />}

      <div className="filter-bar">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            className={`filter-btn ${statusFilter === opt.value ? 'active' : ''}`}
            onClick={() => setStatusFilter(opt.value)}
          >
            {opt.label}
            <span className="filter-count">
              {opt.value ? bills.filter((b) => b.status === opt.value).length : bills.length}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <Spinner text="Loading your bills..." />
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>No bills found</h3>
          <p>{statusFilter ? 'No bills match this filter.' : 'Submit your first bill to get started.'}</p>
          {!statusFilter && (
            <Link to="/employee/submit" className="btn btn-primary">Submit a Bill</Link>
          )}
        </div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Description</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Bill Date</th>
                <th>Submitted</th>
                <th>Status</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((bill, i) => (
                <tr key={bill._id}>
                  <td className="td-index">{i + 1}</td>
                  <td className="td-truncate">{bill.description}</td>
                  <td><span className="category-tag">{bill.category}</span></td>
                  <td className="td-amount">₹{bill.amount?.toLocaleString('en-IN')}</td>
                  <td>{new Date(bill.billDate).toLocaleDateString()}</td>
                  <td>{new Date(bill.createdAt).toLocaleDateString()}</td>
                  <td><StatusBadge status={bill.status} /></td>
                  <td>
                    <Link to={`/bills/${bill._id}`} className="table-link">View →</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyBills;
