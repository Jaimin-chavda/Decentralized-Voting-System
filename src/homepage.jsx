import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import './homepage.css';

export default function homepage() {
  const [activeProposal, setActiveProposal] = useState(0);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  return (
    <div>
      {/* Navigation */}
      <nav className="nav-container">
        <div className="nav-wrapper">
          <div className="logo">GovChain</div>

          <div className="nav-links">
            <a href="#features" className="nav-link">Features</a>
            <a href="#how" className="nav-link">How it Works</a>
            <a href="#docs" className="nav-link">Docs</a>

            {isAuthenticated ? (
              <button className="btn btn-primary" onClick={() => navigate('/profile')}>
                👤 {user?.name || 'Profile'}
              </button>
            ) : (
              <>
                <a href="/login" className="nav-link">Login</a>
                <button className="btn btn-primary" onClick={() => navigate('/signup')}>Sign Up</button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <h1>Decentralized Governance Made Simple</h1>
            
            <p>
              Create proposals, vote transparently, and make decisions together. 
              All powered by blockchain technology.
            </p>

            <div className="hero-buttons">
              <button className="btn btn-primary" onClick={() => window.location.href = '/signup'}>Get Started</button>
              <button className="btn btn-secondary" onClick={() => window.location.href = '/admin'}>View Demo</button>
            </div>

            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-number">1.2K+</div>
                <div className="stat-label">Active Users</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">89</div>
                <div className="stat-label">Proposals</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">$2.4M</div>
                <div className="stat-label">Treasury</div>
              </div>
            </div>
          </div>

          {/* Proposal Preview */}
          <div className="proposal-card">
            <div className="proposal-header">
              <div>
                <div className="proposal-status">ACTIVE</div>
                <h3 className="proposal-title">Community Treasury Allocation</h3>
              </div>
              <div className="proposal-badge">2d left</div>
            </div>

            <p className="proposal-description">
              Proposal to allocate 100,000 tokens from treasury for community 
              development initiatives.
            </p>

            <div className="proposal-votes">
              <div className="votes-labels">
                <span className="vote-for">For: 82%</span>
                <span className="vote-against">Against: 18%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '82%' }}></div>
              </div>
            </div>

            <div className="proposal-actions">
              <button className="vote-btn vote-btn-for">Vote For</button>
              <button className="vote-btn vote-btn-against">Vote Against</button>
            </div>

            <div className="proposal-meta">
              842 votes • 67% quorum reached
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="features-container">
          <div className="section-header">
            <h2 className="section-title">Why use blockchain governance?</h2>
            <p className="section-subtitle">
              Transparent, secure, and efficient decision-making
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3 className="feature-title">Transparent & Secure</h3>
              <p className="feature-description">
                All votes are recorded on the blockchain. No tampering, complete audit trail.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3 className="feature-title">Fast Results</h3>
              <p className="feature-description">
                See voting results in real-time. No waiting for manual counting.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🌍</div>
              <h3 className="feature-title">Accessible Anywhere</h3>
              <p className="feature-description">
                Vote from anywhere in the world with just your wallet.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">💰</div>
              <h3 className="feature-title">Token-Based Voting</h3>
              <p className="feature-description">
                Your voting power is based on token holdings. Fair and verifiable.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">👥</div>
              <h3 className="feature-title">Community Driven</h3>
              <p className="feature-description">
                Anyone can create proposals and participate in governance.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3 className="feature-title">Full History</h3>
              <p className="feature-description">
                Complete record of all decisions and votes, forever accessible.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="how-it-works">
        <div className="steps-container">
          <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '60px' }}>
            How it works
          </h2>

          <div className="steps-grid">
            <div className="step-item">
              <div className="step-number">1</div>
              <h3 className="step-title">Connect Wallet</h3>
              <p className="step-description">
                Link your Web3 wallet to get started
              </p>
            </div>

            <div className="step-item">
              <div className="step-number">2</div>
              <h3 className="step-title">Get Tokens</h3>
              <p className="step-description">
                Receive tokens from our testnet faucet
              </p>
            </div>

            <div className="step-item">
              <div className="step-number">3</div>
              <h3 className="step-title">Vote</h3>
              <p className="step-description">
                Browse proposals and cast your votes
              </p>
            </div>

            <div className="step-item">
              <div className="step-number">4</div>
              <h3 className="step-title">Results</h3>
              <p className="step-description">
                Decisions are executed automatically
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-container">
          <h2 className="cta-title">Ready to get started?</h2>
          <p className="cta-description">
            Join the community and start participating in governance today.
          </p>
          <div className="cta-buttons">
            <button className="btn btn-primary" onClick={() => window.location.href = '/wallet-connect'}>Launch App</button>
            <button className="btn btn-secondary" onClick={() => window.location.href = '#docs'}>Read Docs</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div>
            <div className="footer-brand">GovChain</div>
            <p className="footer-description">
              A decentralized governance platform built on blockchain for 
              transparent decision-making.
            </p>
          </div>

          <div>
            <h4 className="footer-heading">Product</h4>
            <div className="footer-links">
              <a href="#" className="footer-link">Features</a>
              <a href="#" className="footer-link">How it Works</a>
              <a href="#" className="footer-link">Pricing</a>
              <a href="#" className="footer-link">FAQ</a>
            </div>
          </div>

          <div>
            <h4 className="footer-heading">Resources</h4>
            <div className="footer-links">
              <a href="#" className="footer-link">Documentation</a>
              <a href="#" className="footer-link">Guides</a>
              <a href="#" className="footer-link">Blog</a>
              <a href="#" className="footer-link">Support</a>
            </div>
          </div>

          <div>
            <h4 className="footer-heading">Company</h4>
            <div className="footer-links">
              <a href="#" className="footer-link">About</a>
              <a href="#" className="footer-link">Team</a>
              <a href="#" className="footer-link">Careers</a>
              <a href="#" className="footer-link">Contact</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div>© 2024 GovChain. All rights reserved.</div>
          <div className="footer-bottom-links">
            <a href="#" className="footer-link">Privacy</a>
            <a href="#" className="footer-link">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}