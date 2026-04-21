const express = require('express');
const router = express.Router();
const {
  submitBill,
  getMyBills,
  getManagerBills,
  managerAction,
  getHodBills,
  hodAction,
  getAccountsBills,
  getAllBills,
  getBillById,
} = require('../controllers/billController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Employee routes
router.post('/', protect, authorize('employee'), upload.single('attachment'), submitBill);
router.get('/my', protect, authorize('employee'), getMyBills);

// Manager routes
router.get('/manager', protect, authorize('manager'), getManagerBills);
router.put('/:id/manager-action', protect, authorize('manager'), managerAction);

// HOD routes
router.get('/hod', protect, authorize('hod'), getHodBills);
router.put('/:id/hod-action', protect, authorize('hod'), hodAction);

// Accounts routes
router.get('/accounts', protect, authorize('accounts'), getAccountsBills);

// Shared: all bills (manager, hod, accounts can view all)
router.get('/all', protect, authorize('manager', 'hod', 'accounts'), getAllBills);

// Single bill detail
router.get('/:id', protect, getBillById);

module.exports = router;
