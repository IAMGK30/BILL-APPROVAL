import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

const roleLinks = {
  employee: [
    { to: '/employee/dashboard', label: 'Dashboard' },
    { to: '/employee/submit', label: 'Submit Bill' },
    { to: '/employee/bills', label: 'My Bills' },
  ],
  manager: [
    { to: '/manager/dashboard', label: 'Dashboard' },
    { to: '/manager/bills', label: 'Pending Approvals' },
  ],
  hod: [
    { to: '/hod/dashboard', label: 'Dashboard' },
    { to: '/hod/bills', label: 'Pending Approvals' },
  ],
  accounts: [
    { to: '/accounts/dashboard', label: 'Dashboard' },
    { to: '/accounts/bills', label: 'Approved Bills' },
  ],
};

const roleBadgeColors = {
  employee: '#2563eb',
  manager: '#7c3aed',
  hod: '#0891b2',
  accounts: '#059669',
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const links = user ? roleLinks[user.role] || [] : [];

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">📋</span>
          <span className="brand-text">BillFlow</span>
        </Link>

        {user && (
          <>
            <button
              className="hamburger"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <span /><span /><span />
            </button>

            <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
              {links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`nav-link ${location.pathname === link.to ? 'active' : ''}`}
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="navbar-right">
              <div className="user-info">
                <div
                  className="role-badge"
                  style={{ background: roleBadgeColors[user.role] || '#64748b' }}
                >
                  {user.role.toUpperCase()}
                </div>
                <span className="user-name">{user.name}</span>
              </div>
              <button className="btn-logout" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
