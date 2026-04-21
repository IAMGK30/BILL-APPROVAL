# 📋 BillFlow — Bill Approval System

A production-ready full-stack web application for managing company bill/expense reimbursement workflows with multi-level approvals.

---

## 🏗️ Tech Stack

| Layer        | Technology                          |
|-------------|--------------------------------------|
| Frontend    | React 18, React Router v6, Axios     |
| Backend     | Node.js, Express.js                  |
| Database    | MongoDB (Mongoose ODM)               |
| Auth        | JWT + bcrypt                         |
| File Upload | Multer (PDF/Image, max 5 MB)         |
| Email       | Nodemailer (Gmail SMTP)              |
| Styling     | Custom CSS (Light Theme, Responsive) |

---

## 👥 User Roles & Workflow

```
Employee  →  Submit Bill
    ↓
Manager   →  Approve / Reject
    ↓ (if approved)
HOD       →  Final Approve / Reject
    ↓ (if approved)
Accounts  →  View & Process Payment
    + Employee & Accounts receive email notification
```

---

## 📁 Project Structure

```
bill-approval/
├── backend/
│   ├── config/
│   │   ├── db.js              # MongoDB connection
│   │   └── email.js           # Nodemailer + email templates
│   ├── controllers/
│   │   ├── authController.js  # Register, Login, GetMe
│   │   ├── billController.js  # Full bill CRUD + approval actions
│   │   └── userController.js  # User listing
│   ├── middleware/
│   │   ├── authMiddleware.js  # JWT protect + role authorize
│   │   └── uploadMiddleware.js # Multer file upload config
│   ├── models/
│   │   ├── User.js            # User schema (bcrypt, roles)
│   │   └── Bill.js            # Bill schema (full workflow)
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── billRoutes.js
│   │   └── userRoutes.js
│   ├── uploads/               # Uploaded files (auto-created)
│   ├── server.js              # Express entry point
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── AuthContext.js     # Global auth state (Context API)
    │   │   ├── ProtectedRoute.js  # Role-based route guard
    │   │   ├── Navbar.js          # Role-aware navigation
    │   │   ├── StatusBadge.js     # Color-coded bill status
    │   │   ├── BillCard.js        # Reusable bill display card
    │   │   ├── ActionModal.js     # Approve/Reject modal
    │   │   ├── Alert.js           # Success/Error messages
    │   │   └── Spinner.js         # Loading indicator
    │   ├── pages/
    │   │   ├── Login.js
    │   │   ├── Register.js
    │   │   ├── EmployeeDashboard.js
    │   │   ├── SubmitBill.js
    │   │   ├── MyBills.js
    │   │   ├── ManagerDashboard.js
    │   │   ├── ManagerBills.js
    │   │   ├── HodDashboard.js
    │   │   ├── HodBills.js
    │   │   ├── AccountsDashboard.js
    │   │   ├── BillDetail.js
    │   │   └── Unauthorized.js
    │   ├── services/
    │   │   └── api.js             # Axios instance + all API calls
    │   ├── styles/
    │   │   └── global.css         # Complete light-theme stylesheet
    │   ├── App.js                 # Routes + layout
    │   └── index.js
    ├── .env.example
    └── package.json
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js v18+
- MongoDB (local or MongoDB Atlas)
- Gmail account with App Password enabled

---

### 1. Clone / Extract the project

```bash
cd bill-approval
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Create your environment file:
```bash
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/bill_approval
JWT_SECRET=change_this_to_a_long_random_secret_string
JWT_EXPIRE=7d

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password

ACCOUNTS_EMAIL=accounts@yourcompany.com
FRONTEND_URL=http://localhost:3000
```

> **Gmail App Password**: Go to Google Account → Security → 2-Step Verification → App Passwords → Generate one for "Mail".

Start the backend:
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Backend runs at: **http://localhost:5000**

---

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create your environment file:
```bash
cp .env.example .env
```

Edit `.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

Start the frontend:
```bash
npm start
```

Frontend runs at: **http://localhost:3000**

---

## 🔑 API Endpoints

### Auth
| Method | Endpoint             | Access  | Description         |
|--------|----------------------|---------|---------------------|
| POST   | /api/auth/register   | Public  | Register new user   |
| POST   | /api/auth/login      | Public  | Login, get JWT      |
| GET    | /api/auth/me         | Private | Get current user    |

### Bills
| Method | Endpoint                      | Role           | Description                    |
|--------|-------------------------------|----------------|--------------------------------|
| POST   | /api/bills                    | Employee       | Submit bill (multipart/form)   |
| GET    | /api/bills/my                 | Employee       | Get my bills                   |
| GET    | /api/bills/manager            | Manager        | Get pending manager bills      |
| PUT    | /api/bills/:id/manager-action | Manager        | Approve or reject              |
| GET    | /api/bills/hod                | HOD            | Get pending HOD bills          |
| PUT    | /api/bills/:id/hod-action     | HOD            | Final approve or reject        |
| GET    | /api/bills/accounts           | Accounts       | Get all approved bills         |
| GET    | /api/bills/all                | Mgr/HOD/Accts  | Get all bills (with filter)    |
| GET    | /api/bills/:id                | All (own/role) | Get single bill detail         |

### Users
| Method | Endpoint     | Access  | Description              |
|--------|--------------|---------|--------------------------|
| GET    | /api/users   | Private | List users (filter role) |
| GET    | /api/users/:id | Private | Get user by ID         |

---

## 📧 Email Notifications

| Trigger                      | Recipient        |
|------------------------------|-----------------|
| Employee submits bill        | Manager         |
| Manager approves bill        | HOD             |
| HOD fully approves bill      | Employee        |
| HOD fully approves bill      | Accounts team   |
| Manager or HOD rejects bill  | Employee        |

---

## 🔐 Security Features

- Passwords hashed with **bcrypt** (12 salt rounds)
- **JWT** tokens (7-day expiry, configurable)
- **Role-based middleware** on every protected route
- **Multer file validation** (type + size limits)
- **CORS** restricted to frontend origin
- Tokens auto-cleared on 401 responses

---

## 🖼️ Pages Overview

| Page                  | Role      | Features                              |
|-----------------------|-----------|---------------------------------------|
| Login                 | All       | JWT auth, role-based redirect         |
| Register              | All       | Role selection, validation            |
| Employee Dashboard    | Employee  | Stats, recent bills, quick submit     |
| Submit Bill           | Employee  | Full form, file upload, email suggest |
| My Bills              | Employee  | Filter by status, full list           |
| Manager Dashboard     | Manager   | Pending queue, stats, activity log    |
| Manager Bills         | Manager   | Cards with Approve/Reject modal       |
| HOD Dashboard         | HOD       | Manager-approved queue, total values  |
| HOD Bills             | HOD       | Final approval with remarks           |
| Accounts Dashboard    | Accounts  | All approved, search, total payable   |
| Bill Detail           | All       | Full info + approval timeline         |

---

## 🛠️ Troubleshooting

**MongoDB won't connect:**
- Ensure MongoDB is running: `mongod --dbpath /data/db`
- Or use MongoDB Atlas free tier and update `MONGO_URI`

**Emails not sending:**
- Use Gmail **App Password**, not your regular password
- Enable 2-Step Verification on your Google account first
- Check spam folder during testing

**CORS errors:**
- Ensure `FRONTEND_URL` in backend `.env` matches your React dev URL exactly

**File upload fails:**
- The `uploads/` folder is created automatically
- Check write permissions on the backend directory

---

## 📦 npm Scripts

### Backend
```bash
npm run dev    # nodemon (auto-reload)
npm start      # node server.js
```

### Frontend
```bash
npm start      # React dev server
npm run build  # Production build
```
