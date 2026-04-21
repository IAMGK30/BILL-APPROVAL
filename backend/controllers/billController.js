const Bill = require('../models/Bill');
const { sendEmail, emailTemplates } = require('../config/email');

// @desc    Submit a new bill
// @route   POST /api/bills
// @access  Private (Employee)
const submitBill = async (req, res) => {
  try {
    const {
      employeeName,
      employeeId,
      designation,
      department,
      amount,
      category,
      description,
      billDate,
      managerEmail,
      hodEmail,
    } = req.body;

    // Build attachment object if file was uploaded
    let attachment = null;
    if (req.file) {
      attachment = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
      };
    }

    const bill = await Bill.create({
      submittedBy: req.user._id,
      employeeName,
      employeeId,
      designation,
      department,
      amount: parseFloat(amount),
      category,
      description,
      billDate,
      managerEmail,
      hodEmail,
      attachment,
      status: 'pending_manager',
    });

    // Send email to manager
    const { subject, html } = emailTemplates.billSubmitted(bill);
    await sendEmail(managerEmail, subject, html);

    res.status(201).json({
      message: 'Bill submitted successfully. Manager has been notified.',
      bill,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to submit bill.' });
  }
};

// @desc    Get bills for the logged-in employee
// @route   GET /api/bills/my
// @access  Private (Employee)
const getMyBills = async (req, res) => {
  try {
    const bills = await Bill.find({ submittedBy: req.user._id })
      .sort({ createdAt: -1 })
      .populate('submittedBy', 'name email');

    res.json({ bills });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get bills pending manager approval (matching logged-in manager's email)
// @route   GET /api/bills/manager
// @access  Private (Manager)
const getManagerBills = async (req, res) => {
  try {
    const bills = await Bill.find({
      managerEmail: req.user.email,
      status: 'pending_manager',
    })
      .sort({ createdAt: -1 })
      .populate('submittedBy', 'name email role');

    res.json({ bills });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Manager approves or rejects a bill
// @route   PUT /api/bills/:id/manager-action
// @access  Private (Manager)
const managerAction = async (req, res) => {
  try {
    const { action, remarks } = req.body;

    if (!['approved', 'rejected'].includes(action)) {
      return res.status(400).json({ message: 'Action must be "approved" or "rejected".' });
    }

    const bill = await Bill.findById(req.params.id);
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found.' });
    }

    if (bill.status !== 'pending_manager') {
      return res.status(400).json({ message: 'Bill is not pending manager approval.' });
    }

    if (bill.managerEmail !== req.user.email) {
      return res.status(403).json({ message: 'You are not the assigned manager for this bill.' });
    }

    bill.managerApprovedBy = req.user._id;
    bill.managerApprovedAt = new Date();
    bill.managerRemarks = remarks || '';
    bill.managerAction = action;

    if (action === 'approved') {
      bill.status = 'pending_hod';
      // Notify HOD
      const { subject, html } = emailTemplates.managerApproved(bill);
      await sendEmail(bill.hodEmail, subject, html);
    } else {
      bill.status = 'rejected';
      bill.rejectedAt = new Date();
      bill.rejectedBy = req.user._id;
      bill.rejectionStage = 'Manager';
      bill.rejectionRemarks = remarks || '';
      // Notify employee
      const { subject, html } = emailTemplates.rejected(bill, 'Manager', remarks);
      const employeeUser = await bill.populate('submittedBy', 'email');
      await sendEmail(employeeUser.submittedBy.email, subject, html);
    }

    await bill.save();

    res.json({
      message: `Bill ${action} successfully.`,
      bill,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get bills pending HOD approval
// @route   GET /api/bills/hod
// @access  Private (HOD)
const getHodBills = async (req, res) => {
  try {
    const bills = await Bill.find({
      hodEmail: req.user.email,
      status: 'pending_hod',
    })
      .sort({ createdAt: -1 })
      .populate('submittedBy', 'name email role')
      .populate('managerApprovedBy', 'name email');

    res.json({ bills });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    HOD approves or rejects a bill
// @route   PUT /api/bills/:id/hod-action
// @access  Private (HOD)
const hodAction = async (req, res) => {
  try {
    const { action, remarks } = req.body;

    if (!['approved', 'rejected'].includes(action)) {
      return res.status(400).json({ message: 'Action must be "approved" or "rejected".' });
    }

    const bill = await Bill.findById(req.params.id).populate('submittedBy', 'email name');
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found.' });
    }

    if (bill.status !== 'pending_hod') {
      return res.status(400).json({ message: 'Bill is not pending HOD approval.' });
    }

    if (bill.hodEmail !== req.user.email) {
      return res.status(403).json({ message: 'You are not the assigned HOD for this bill.' });
    }

    bill.hodApprovedBy = req.user._id;
    bill.hodApprovedAt = new Date();
    bill.hodRemarks = remarks || '';
    bill.hodAction = action;

    if (action === 'approved') {
      bill.status = 'approved';

      // Email to employee
      const empTemplate = emailTemplates.finalApproved(bill);
      await sendEmail(bill.submittedBy.email, empTemplate.subject, empTemplate.html);

      // Email to accounts
      const accTemplate = emailTemplates.accountsNotification(bill);
      const accountsEmail = process.env.ACCOUNTS_EMAIL || 'accounts@company.com';
      await sendEmail(accountsEmail, accTemplate.subject, accTemplate.html);
    } else {
      bill.status = 'rejected';
      bill.rejectedAt = new Date();
      bill.rejectedBy = req.user._id;
      bill.rejectionStage = 'HOD';
      bill.rejectionRemarks = remarks || '';

      // Notify employee of rejection
      const { subject, html } = emailTemplates.rejected(bill, 'HOD', remarks);
      await sendEmail(bill.submittedBy.email, subject, html);
    }

    await bill.save();

    res.json({
      message: `Bill ${action} successfully.`,
      bill,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all approved bills (Accounts view)
// @route   GET /api/bills/accounts
// @access  Private (Accounts)
const getAccountsBills = async (req, res) => {
  try {
    const bills = await Bill.find({ status: 'approved' })
      .sort({ hodApprovedAt: -1 })
      .populate('submittedBy', 'name email department')
      .populate('managerApprovedBy', 'name email')
      .populate('hodApprovedBy', 'name email');

    res.json({ bills });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all bills (admin/accounts summary)
// @route   GET /api/bills/all
// @access  Private (Accounts, HOD, Manager)
const getAllBills = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const bills = await Bill.find(filter)
      .sort({ createdAt: -1 })
      .populate('submittedBy', 'name email department')
      .populate('managerApprovedBy', 'name email')
      .populate('hodApprovedBy', 'name email');

    res.json({ bills });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single bill by ID
// @route   GET /api/bills/:id
// @access  Private
const getBillById = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id)
      .populate('submittedBy', 'name email role designation department')
      .populate('managerApprovedBy', 'name email')
      .populate('hodApprovedBy', 'name email')
      .populate('rejectedBy', 'name email');

    if (!bill) {
      return res.status(404).json({ message: 'Bill not found.' });
    }

    // Only allow access if user is submitter, manager, hod, or accounts
    const userId = req.user._id.toString();
    const isOwner = bill.submittedBy._id.toString() === userId;
    const isPrivileged = ['manager', 'hod', 'accounts'].includes(req.user.role);

    if (!isOwner && !isPrivileged) {
      return res.status(403).json({ message: 'Not authorized to view this bill.' });
    }

    res.json({ bill });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  submitBill,
  getMyBills,
  getManagerBills,
  managerAction,
  getHodBills,
  hodAction,
  getAccountsBills,
  getAllBills,
  getBillById,
};
