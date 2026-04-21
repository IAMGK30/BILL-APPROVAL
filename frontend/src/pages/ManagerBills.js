import React, { useEffect, useState } from 'react';
import { getManagerBills, managerAction } from '../services/api';
import BillCard from '../components/BillCard';
import ActionModal from '../components/ActionModal';
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';

const ManagerBills = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [modal, setModal] = useState({ open: false, bill: null, action: '' });

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      const { data } = await getManagerBills();
      setBills(data.bills || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load bills.');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (bill, action) => {
    setModal({ open: true, bill, action });
  };

  const closeModal = () => {
    setModal({ open: false, bill: null, action: '' });
  };

  const handleConfirm = async (action, remarks) => {
    setActionLoading(true);
    try {
      await managerAction(modal.bill._id, { action, remarks });
      setSuccess(`Bill ${action === 'approved' ? 'approved and forwarded to HOD' : 'rejected'} successfully.`);
      setBills((prev) => prev.filter((b) => b._id !== modal.bill._id));
      closeModal();
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed.');
      closeModal();
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Pending Approvals</h1>
          <p className="page-subtitle">
            {bills.length} bill{bills.length !== 1 ? 's' : ''} awaiting your review.
          </p>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      {loading ? (
        <Spinner text="Loading pending bills..." />
      ) : bills.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎉</div>
          <h3>All caught up!</h3>
          <p>No bills are pending your approval.</p>
        </div>
      ) : (
        <div className="cards-grid">
          {bills.map((bill) => (
            <BillCard
              key={bill._id}
              bill={bill}
              actions={
                <>
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() => openModal(bill, 'approved')}
                  >
                    ✅ Approve
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => openModal(bill, 'rejected')}
                  >
                    ❌ Reject
                  </button>
                </>
              }
            />
          ))}
        </div>
      )}

      <ActionModal
        isOpen={modal.open}
        onClose={closeModal}
        onConfirm={handleConfirm}
        action={modal.action}
        billName={modal.bill?.employeeName}
        loading={actionLoading}
      />
    </div>
  );
};

export default ManagerBills;
