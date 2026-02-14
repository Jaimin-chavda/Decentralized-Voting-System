import React, { useState } from 'react';
import { DEMO_ADMIN, SEED_PROPOSALS } from '../data/demoData';
import ProposalManager from './ProposalManager';
import CandidateManager from './CandidateManager';
import { useToast } from '../utils/toast';
import './admin.css';

export default function AdminDashboard() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Dashboard state
  const [activeTab, setActiveTab] = useState('proposals');
  const [proposals, setProposals] = useState(SEED_PROPOSALS);
  const { addToast } = useToast();

  // Compute stats
  const totalProposals = proposals.length;
  const activeProposals = proposals.filter((p) => p.status === 'active').length;
  const totalCandidates = proposals.reduce((s, p) => s + (p.candidates?.length || 0), 0);
  const totalVotes = proposals.reduce(
    (s, p) => s + (p.candidates || []).reduce((vs, c) => vs + c.votes, 0),
    0
  );

  // Login handler
  const handleLogin = (e) => {
    e.preventDefault();
    if (loginEmail === DEMO_ADMIN.email && loginPassword === DEMO_ADMIN.password) {
      setIsAuthenticated(true);
      setLoginError('');
      addToast({ message: 'Welcome, Admin!', type: 'success' });
    } else {
      setLoginError('Invalid credentials. Try admin@govchain.io / admin123');
    }
  };

  // Logout handler
  const handleLogout = () => {
    setIsAuthenticated(false);
    setLoginEmail('');
    setLoginPassword('');
    addToast({ message: 'Logged out.', type: 'info' });
  };

  // Login gate
  if (!isAuthenticated) {
    return (
      <div className="admin-login-page">
        <div className="admin-login-card">
          <div className="admin-login-header">
            <h1 className="admin-login-logo">GovChain</h1>
            <span className="admin-badge">ADMIN</span>
          </div>
          <h2 className="admin-login-title">Admin Panel</h2>
          <p className="admin-login-subtitle">Sign in to manage proposals & candidates</p>

          {loginError && <div className="admin-login-error">{loginError}</div>}

          <form onSubmit={handleLogin}>
            <div className="admin-form-group">
              <label>Email</label>
              <input
                type="email"
                className="form-input"
                placeholder="admin@govchain.io"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
              />
            </div>
            <div className="admin-form-group">
              <label>Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="admin123"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary admin-login-btn">
              Sign In
            </button>
          </form>

          <div className="admin-demo-hint">
            <strong>Demo credentials:</strong> admin@govchain.io / admin123
          </div>
        </div>
      </div>
    );
  }

  // Dashboard view
  return (
    <div className="admin-layout">
      {/* Top Bar */}
      <header className="admin-topbar">
        <div className="admin-topbar-left">
          <h1 className="admin-topbar-logo">GovChain</h1>
          <span className="admin-badge">ADMIN</span>
        </div>
        <div className="admin-topbar-right">
          <span className="admin-user">👤 {DEMO_ADMIN.name}</span>
          <button className="btn btn-secondary admin-logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <main className="admin-main">
        {/* Stats Row */}
        <div className="admin-stats-row">
          <div className="admin-stat-card stat-blue">
            <div className="admin-stat-icon">📋</div>
            <div>
              <div className="admin-stat-number">{totalProposals}</div>
              <div className="admin-stat-label">Total Proposals</div>
            </div>
          </div>
          <div className="admin-stat-card stat-green">
            <div className="admin-stat-icon">✅</div>
            <div>
              <div className="admin-stat-number">{activeProposals}</div>
              <div className="admin-stat-label">Active</div>
            </div>
          </div>
          <div className="admin-stat-card stat-purple">
            <div className="admin-stat-icon">👥</div>
            <div>
              <div className="admin-stat-number">{totalCandidates}</div>
              <div className="admin-stat-label">Candidates</div>
            </div>
          </div>
          <div className="admin-stat-card stat-orange">
            <div className="admin-stat-icon">🗳️</div>
            <div>
              <div className="admin-stat-number">{totalVotes.toLocaleString()}</div>
              <div className="admin-stat-label">Total Votes</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="admin-tabs">
          <button
            className={`admin-tab ${activeTab === 'proposals' ? 'admin-tab-active' : ''}`}
            onClick={() => setActiveTab('proposals')}
          >
            📋 Proposals
          </button>
          <button
            className={`admin-tab ${activeTab === 'candidates' ? 'admin-tab-active' : ''}`}
            onClick={() => setActiveTab('candidates')}
          >
            👥 Candidates
          </button>
        </div>

        {/* Tab Content */}
        <div className="admin-content">
          {activeTab === 'proposals' && (
            <ProposalManager proposals={proposals} setProposals={setProposals} />
          )}
          {activeTab === 'candidates' && (
            <CandidateManager proposals={proposals} setProposals={setProposals} />
          )}
        </div>
      </main>
    </div>
  );
}
