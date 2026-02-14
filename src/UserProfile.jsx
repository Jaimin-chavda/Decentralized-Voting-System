import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useToast } from './utils/toast';
import './profile.css';

export default function UserProfile() {
  const { user, updateProfile, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();

  // Redirect if not logged in
  if (!user) {
    navigate('/login');
    return null;
  }

  const [name, setName] = useState(user.name || '');
  const [email, setEmail] = useState(user.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saved, setSaved] = useState(false);

  // Save profile info
  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateProfile({ name, email });
    setSaved(true);
    addToast({ message: 'Profile updated successfully!', type: 'success' });
    setTimeout(() => setSaved(false), 2000);
  };

  // Change password
  const handleChangePassword = (e) => {
    e.preventDefault();
    if (!currentPassword) {
      addToast({ message: 'Enter your current password.', type: 'error' });
      return;
    }
    if (newPassword.length < 6) {
      addToast({ message: 'New password must be at least 6 characters.', type: 'error' });
      return;
    }
    if (newPassword !== confirmPassword) {
      addToast({ message: 'Passwords do not match.', type: 'error' });
      return;
    }
    // Demo: just show success (no real backend)
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    addToast({ message: 'Password changed successfully!', type: 'success' });
  };

  // Logout
  const handleLogout = () => {
    logout();
    addToast({ message: 'Logged out.', type: 'info' });
    navigate('/');
  };

  return (
    <div className="profile-page">
      {/* Top bar */}
      <header className="profile-topbar">
        <a href="/" className="profile-topbar-logo">GovChain</a>
        <div className="profile-topbar-right">
          <span className="profile-topbar-name">👤 {user.name}</span>
          {isAdmin && <span className="admin-badge">ADMIN</span>}
        </div>
      </header>

      <main className="profile-main">
        <div className="profile-sidebar">
          <div className="profile-avatar-section">
            <div className="profile-avatar-circle">
              {user.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <h2 className="profile-sidebar-name">{user.name}</h2>
            <p className="profile-sidebar-email">{user.email}</p>
            <span className={`profile-role-badge ${isAdmin ? 'role-admin' : 'role-user'}`}>
              {isAdmin ? 'Administrator' : 'Member'}
            </span>
          </div>

          <nav className="profile-sidebar-nav">
            <a href="/" className="profile-nav-link">← Back to Home</a>
            {isAdmin && <a href="/admin" className="profile-nav-link">🛠 Admin Panel</a>}
            <button className="profile-nav-link profile-logout-link" onClick={handleLogout}>
              🚪 Logout
            </button>
          </nav>
        </div>

        <div className="profile-content">
          {/* Profile Details Card */}
          <div className="profile-card">
            <h3 className="profile-card-title">Profile Details</h3>
            <form onSubmit={handleSaveProfile}>
              <div className="profile-form-grid">
                <div className="profile-form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="profile-form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="profile-form-group">
                  <label>Role</label>
                  <input
                    type="text"
                    className="form-input"
                    value={isAdmin ? 'Administrator' : 'Member'}
                    disabled
                  />
                </div>
                <div className="profile-form-group">
                  <label>Joined</label>
                  <input
                    type="text"
                    className="form-input"
                    value="February 2026"
                    disabled
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary profile-save-btn">
                {saved ? '✓ Saved' : 'Save Changes'}
              </button>
            </form>
          </div>

          {/* Change Password Card */}
          <div className="profile-card">
            <h3 className="profile-card-title">Change Password</h3>
            <form onSubmit={handleChangePassword}>
              <div className="profile-form-grid">
                <div className="profile-form-group profile-form-full">
                  <label>Current Password</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>
                <div className="profile-form-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="profile-form-group">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary profile-save-btn">
                Update Password
              </button>
            </form>
          </div>

          {/* Danger Zone */}
          <div className="profile-card profile-danger-card">
            <h3 className="profile-card-title" style={{ color: '#dc2626' }}>Danger Zone</h3>
            <p className="profile-danger-text">
              Logging out will end your session. You will need to sign in again.
            </p>
            <button className="btn profile-danger-btn" onClick={handleLogout}>
              🚪 Logout
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
