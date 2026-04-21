const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send email utility
 * @param {string} to - recipient email
 * @param {string} subject - email subject
 * @param {string} html - HTML body
 */
const sendEmail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Bill Approval System" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`📧 Email sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Email failed to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
};

// Email templates
const emailTemplates = {
  billSubmitted: (bill) => ({
    subject: `[Action Required] New Bill Submitted by ${bill.employeeName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #2563eb; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="color: white; margin: 0;">New Bill Awaiting Your Approval</h2>
        </div>
        <div style="background: #f8fafc; padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
          <p style="color: #475569;">A new bill has been submitted and requires your approval.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tr><td style="padding: 8px; font-weight: bold; color: #1e293b; width: 40%;">Employee Name</td><td style="padding: 8px; color: #475569;">${bill.employeeName}</td></tr>
            <tr style="background:#fff;"><td style="padding: 8px; font-weight: bold; color: #1e293b;">Employee ID</td><td style="padding: 8px; color: #475569;">${bill.employeeId}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold; color: #1e293b;">Designation</td><td style="padding: 8px; color: #475569;">${bill.designation}</td></tr>
            <tr style="background:#fff;"><td style="padding: 8px; font-weight: bold; color: #1e293b;">Amount</td><td style="padding: 8px; color: #16a34a; font-weight: bold;">₹${bill.amount}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold; color: #1e293b;">Category</td><td style="padding: 8px; color: #475569;">${bill.category}</td></tr>
            <tr style="background:#fff;"><td style="padding: 8px; font-weight: bold; color: #1e293b;">Description</td><td style="padding: 8px; color: #475569;">${bill.description}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold; color: #1e293b;">Submitted On</td><td style="padding: 8px; color: #475569;">${new Date(bill.createdAt).toLocaleDateString()}</td></tr>
          </table>
          <p style="color: #64748b; font-size: 14px;">Please log in to the Bill Approval System to review and take action.</p>
        </div>
      </div>
    `,
  }),

  managerApproved: (bill) => ({
    subject: `[Action Required] Bill Approved by Manager - ${bill.employeeName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #7c3aed; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="color: white; margin: 0;">Bill Approved by Manager – HOD Action Required</h2>
        </div>
        <div style="background: #f8fafc; padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
          <p style="color: #475569;">The following bill has been approved by the Manager and now requires HOD approval.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tr><td style="padding: 8px; font-weight: bold; color: #1e293b; width: 40%;">Employee Name</td><td style="padding: 8px; color: #475569;">${bill.employeeName}</td></tr>
            <tr style="background:#fff;"><td style="padding: 8px; font-weight: bold; color: #1e293b;">Amount</td><td style="padding: 8px; color: #16a34a; font-weight: bold;">₹${bill.amount}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold; color: #1e293b;">Category</td><td style="padding: 8px; color: #475569;">${bill.category}</td></tr>
            <tr style="background:#fff;"><td style="padding: 8px; font-weight: bold; color: #1e293b;">Manager Remarks</td><td style="padding: 8px; color: #475569;">${bill.managerRemarks || 'No remarks'}</td></tr>
          </table>
          <p style="color: #64748b; font-size: 14px;">Please log in to the Bill Approval System to review and take action.</p>
        </div>
      </div>
    `,
  }),

  finalApproved: (bill) => ({
    subject: `✅ Your Bill Has Been Fully Approved`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #16a34a; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="color: white; margin: 0;">🎉 Bill Fully Approved!</h2>
        </div>
        <div style="background: #f8fafc; padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
          <p style="color: #475569;">Great news! Your bill has been approved by both Manager and HOD.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tr><td style="padding: 8px; font-weight: bold; color: #1e293b; width: 40%;">Employee Name</td><td style="padding: 8px; color: #475569;">${bill.employeeName}</td></tr>
            <tr style="background:#fff;"><td style="padding: 8px; font-weight: bold; color: #1e293b;">Employee ID</td><td style="padding: 8px; color: #475569;">${bill.employeeId}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold; color: #1e293b;">Amount</td><td style="padding: 8px; color: #16a34a; font-weight: bold;">₹${bill.amount}</td></tr>
            <tr style="background:#fff;"><td style="padding: 8px; font-weight: bold; color: #1e293b;">Category</td><td style="padding: 8px; color: #475569;">${bill.category}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold; color: #1e293b;">HOD Remarks</td><td style="padding: 8px; color: #475569;">${bill.hodRemarks || 'No remarks'}</td></tr>
          </table>
          <p style="color: #16a34a; font-weight: bold;">The Accounts team has been notified for payment processing.</p>
        </div>
      </div>
    `,
  }),

  accountsNotification: (bill) => ({
    subject: `[Accounts] New Approved Bill for Payment – ${bill.employeeName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #0f172a; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="color: white; margin: 0;">New Bill Ready for Payment Processing</h2>
        </div>
        <div style="background: #f8fafc; padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
          <p style="color: #475569;">The following bill has been fully approved and is ready for payment.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tr><td style="padding: 8px; font-weight: bold; color: #1e293b; width: 40%;">Employee Name</td><td style="padding: 8px; color: #475569;">${bill.employeeName}</td></tr>
            <tr style="background:#fff;"><td style="padding: 8px; font-weight: bold; color: #1e293b;">Employee ID</td><td style="padding: 8px; color: #475569;">${bill.employeeId}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold; color: #1e293b;">Designation</td><td style="padding: 8px; color: #475569;">${bill.designation}</td></tr>
            <tr style="background:#fff;"><td style="padding: 8px; font-weight: bold; color: #1e293b;">Amount</td><td style="padding: 8px; color: #16a34a; font-weight: bold;">₹${bill.amount}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold; color: #1e293b;">Category</td><td style="padding: 8px; color: #475569;">${bill.category}</td></tr>
            <tr style="background:#fff;"><td style="padding: 8px; font-weight: bold; color: #1e293b;">Description</td><td style="padding: 8px; color: #475569;">${bill.description}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold; color: #1e293b;">Submitted On</td><td style="padding: 8px; color: #475569;">${new Date(bill.createdAt).toLocaleDateString()}</td></tr>
            <tr style="background:#fff;"><td style="padding: 8px; font-weight: bold; color: #1e293b;">Approved On</td><td style="padding: 8px; color: #475569;">${new Date(bill.hodApprovedAt).toLocaleDateString()}</td></tr>
          </table>
          <p style="color: #64748b; font-size: 14px;">Please log in to the Bill Approval System to view the attached bill document.</p>
        </div>
      </div>
    `,
  }),

  rejected: (bill, stage, remarks) => ({
    subject: `❌ Your Bill Has Been Rejected`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #dc2626; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="color: white; margin: 0;">Bill Rejected</h2>
        </div>
        <div style="background: #f8fafc; padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
          <p style="color: #475569;">Your bill has been rejected at the <strong>${stage}</strong> stage.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tr><td style="padding: 8px; font-weight: bold; color: #1e293b; width: 40%;">Employee Name</td><td style="padding: 8px; color: #475569;">${bill.employeeName}</td></tr>
            <tr style="background:#fff;"><td style="padding: 8px; font-weight: bold; color: #1e293b;">Amount</td><td style="padding: 8px; color: #475569;">₹${bill.amount}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold; color: #1e293b;">Rejection Reason</td><td style="padding: 8px; color: #dc2626;">${remarks || 'No reason provided'}</td></tr>
          </table>
          <p style="color: #64748b; font-size: 14px;">Please contact your ${stage} for more details or resubmit with corrections.</p>
        </div>
      </div>
    `,
  }),
};

module.exports = { sendEmail, emailTemplates };
