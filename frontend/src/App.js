import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import EmployeeDashboard from './pages/EmployeeDashboard';
import SubmitBill from './pages/SubmitBill';
import MyBills from './pages/MyBills';
import ManagerDashboard from './pages/ManagerDashboard';
import ManagerBills from './pages/ManagerBills';
import HodDashboard from './pages/HodDashboard';
import HodBills from './pages/HodBills';
import AccountsDashboard from './pages/AccountsDashboard';
import BillDetail from './pages/BillDetail';
import Unauthorized from './pages/Unauthorized';

import './styles/global.css';

// Root redirect based on role
const RootRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  const dashboards = {
    employee: '/employee/dashboard',
    manager: '/manager/dashboard',
    hod: '/hod/dashboard',
    accounts: '/accounts/dashboard',
  };
  return <Navigate to={dashboards[user.role] || '/login'} replace />;
};

const AppLayout = ({ children }) => (
  <>
    <Navbar />
    <main className="main-content">{children}</main>
  </>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Root */}
          <Route path="/" element={<RootRedirect />} />

          {/* Employee */}
          <Route
            path="/employee/dashboard"
            element={
              <ProtectedRoute allowedRoles={['employee']}>
                <AppLayout><EmployeeDashboard /></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/submit"
            element={
              <ProtectedRoute allowedRoles={['employee']}>
                <AppLayout><SubmitBill /></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/bills"
            element={
              <ProtectedRoute allowedRoles={['employee']}>
                <AppLayout><MyBills /></AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Manager */}
          <Route
            path="/manager/dashboard"
            element={
              <ProtectedRoute allowedRoles={['manager']}>
                <AppLayout><ManagerDashboard /></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/bills"
            element={
              <ProtectedRoute allowedRoles={['manager']}>
                <AppLayout><ManagerBills /></AppLayout>
              </ProtectedRoute>
            }
          />

          {/* HOD */}
          <Route
            path="/hod/dashboard"
            element={
              <ProtectedRoute allowedRoles={['hod']}>
                <AppLayout><HodDashboard /></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/hod/bills"
            element={
              <ProtectedRoute allowedRoles={['hod']}>
                <AppLayout><HodBills /></AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Accounts */}
          <Route
            path="/accounts/dashboard"
            element={
              <ProtectedRoute allowedRoles={['accounts']}>
                <AppLayout><AccountsDashboard /></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/accounts/bills"
            element={
              <ProtectedRoute allowedRoles={['accounts']}>
                <AppLayout><AccountsDashboard /></AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Shared bill detail */}
          <Route
            path="/bills/:id"
            element={
              <ProtectedRoute allowedRoles={['employee', 'manager', 'hod', 'accounts']}>
                <AppLayout><BillDetail /></AppLayout>
              </ProtectedRoute>
            }
          />

          {/* 404 fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
