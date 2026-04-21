import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitBill, getUsers } from '../services/api';
import { useAuth } from '../components/AuthContext';
import Alert from '../components/Alert';

const CATEGORIES = ['Travel', 'Food', 'Accommodation', 'Medical', 'Office Supplies', 'Training', 'Other'];

const SubmitBill = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    employeeName: user?.name || '',
    employeeId: user?.employeeId || '',
    designation: user?.designation || '',
    department: user?.department || '',
    amount: '',
    category: '',
    description: '',
    billDate: '',
    managerEmail: '',
    hodEmail: '',
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [managers, setManagers] = useState([]);
  const [hods, setHods] = useState([]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const [mRes, hRes] = await Promise.all([
        getUsers('manager'),
        getUsers('hod'),
      ]);
      setManagers(mRes.data.users || []);
      setHods(hRes.data.users || []);
    } catch {
      // Non-critical, just suggestions
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5 MB.');
      return;
    }
    setFile(selected);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || !form.category || !form.description || !form.billDate ||
        !form.managerEmail || !form.hodEmail || !form.employeeName || !form.employeeId) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, val]) => formData.append(key, val));
      if (file) formData.append('attachment', file);

      await submitBill(formData);
      setSuccess('Bill submitted successfully! Your manager has been notified.');
      setTimeout(() => navigate('/employee/bills'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit bill.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Submit New Bill</h1>
          <p className="page-subtitle">Fill in the details below to submit your reimbursement request.</p>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} />}

      <div className="form-card">
        <form onSubmit={handleSubmit}>
          {/* Employee Info */}
          <div className="form-section">
            <h3 className="form-section-title">Employee Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Full Name <span className="required">*</span></label>
                <input
                  type="text"
                  name="employeeName"
                  className="form-input"
                  value={form.employeeName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Employee ID <span className="required">*</span></label>
                <input
                  type="text"
                  name="employeeId"
                  className="form-input"
                  value={form.employeeId}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Designation</label>
                <input
                  type="text"
                  name="designation"
                  className="form-input"
                  value={form.designation}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Department</label>
                <input
                  type="text"
                  name="department"
                  className="form-input"
                  value={form.department}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Bill Details */}
          <div className="form-section">
            <h3 className="form-section-title">Bill Details</h3>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Amount (₹) <span className="required">*</span></label>
                <input
                  type="number"
                  name="amount"
                  className="form-input"
                  placeholder="0.00"
                  min="1"
                  step="0.01"
                  value={form.amount}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Category <span className="required">*</span></label>
                <select
                  name="category"
                  className="form-select"
                  value={form.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Bill Date <span className="required">*</span></label>
                <input
                  type="date"
                  name="billDate"
                  className="form-input"
                  value={form.billDate}
                  onChange={handleChange}
                  max={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Attachment (PDF / Image)</label>
                <input
                  type="file"
                  className="form-input"
                  accept=".pdf,.jpg,.jpeg,.png,.gif"
                  onChange={handleFileChange}
                />
                <span className="form-hint">Max 5 MB · PDF, JPG, PNG</span>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Description <span className="required">*</span></label>
              <textarea
                name="description"
                className="form-textarea"
                rows={3}
                placeholder="Briefly describe this expense..."
                value={form.description}
                onChange={handleChange}
                maxLength={500}
                required
              />
              <span className="form-hint">{form.description.length}/500</span>
            </div>
          </div>

          {/* Approval Routing */}
          <div className="form-section">
            <h3 className="form-section-title">Approval Routing</h3>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Manager Email <span className="required">*</span></label>
                <input
                  type="email"
                  name="managerEmail"
                  className="form-input"
                  placeholder="manager@company.com"
                  list="manager-list"
                  value={form.managerEmail}
                  onChange={handleChange}
                  required
                />
                <datalist id="manager-list">
                  {managers.map((m) => (
                    <option key={m._id} value={m.email}>{m.name} — {m.email}</option>
                  ))}
                </datalist>
              </div>
              <div className="form-group">
                <label className="form-label">HOD Email <span className="required">*</span></label>
                <input
                  type="email"
                  name="hodEmail"
                  className="form-input"
                  placeholder="hod@company.com"
                  list="hod-list"
                  value={form.hodEmail}
                  onChange={handleChange}
                  required
                />
                <datalist id="hod-list">
                  {hods.map((h) => (
                    <option key={h._id} value={h.email}>{h.name} — {h.email}</option>
                  ))}
                </datalist>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <span className="btn-loading"><span className="spinner-sm" /> Submitting...</span>
              ) : (
                '📤 Submit Bill'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitBill;
