const mongoose = require('mongoose');

const billSchema = new mongoose.Schema(
  {
    // Employee info at time of submission
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    employeeName: {
      type: String,
      required: [true, 'Employee name is required'],
      trim: true,
    },
    employeeId: {
      type: String,
      required: [true, 'Employee ID is required'],
      trim: true,
    },
    designation: {
      type: String,
      required: [true, 'Designation is required'],
      trim: true,
    },
    department: {
      type: String,
      trim: true,
    },

    // Bill details
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [1, 'Amount must be greater than 0'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Travel', 'Food', 'Accommodation', 'Medical', 'Office Supplies', 'Training', 'Other'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    billDate: {
      type: Date,
      required: [true, 'Bill date is required'],
    },

    // File attachment
    attachment: {
      filename: String,
      originalName: String,
      mimetype: String,
      size: Number,
      path: String,
    },

    // Approval routing
    managerEmail: {
      type: String,
      required: [true, 'Manager email is required'],
      lowercase: true,
      trim: true,
    },
    hodEmail: {
      type: String,
      required: [true, 'HOD email is required'],
      lowercase: true,
      trim: true,
    },

    // Workflow status
    status: {
      type: String,
      enum: ['pending_manager', 'pending_hod', 'approved', 'rejected'],
      default: 'pending_manager',
    },

    // Manager approval
    managerApprovedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    managerApprovedAt: Date,
    managerRemarks: {
      type: String,
      trim: true,
    },
    managerAction: {
      type: String,
      enum: ['approved', 'rejected'],
    },

    // HOD approval
    hodApprovedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    hodApprovedAt: Date,
    hodRemarks: {
      type: String,
      trim: true,
    },
    hodAction: {
      type: String,
      enum: ['approved', 'rejected'],
    },

    // Rejection details
    rejectedAt: Date,
    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    rejectionStage: {
      type: String,
      enum: ['Manager', 'HOD'],
    },
    rejectionRemarks: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
billSchema.index({ submittedBy: 1, status: 1 });
billSchema.index({ managerEmail: 1, status: 1 });
billSchema.index({ hodEmail: 1, status: 1 });
billSchema.index({ status: 1 });

module.exports = mongoose.model('Bill', billSchema);
