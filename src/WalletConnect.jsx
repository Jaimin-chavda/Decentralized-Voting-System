import React, { useState } from 'react';
import useWallet, { shortenAddress } from './hooks/useWallet';
import { useToast } from './utils/toast';
import './Auth.css';

export default function WalletConnect() {
  const {
    account,
    network,
    loading,
    error,
    isConnected,
    isMetaMaskInstalled,
    isWrongNetwork,
    requiredChainName,
    connectWallet,
    disconnectWallet,
    authenticateWithSignature,
    readContractExample,
    clearError,
  } = useWallet();

  const { addToast } = useToast();
  const [contractResult, setContractResult] = useState(null);

  // Connect wallet handler
  const handleConnect = async () => {
    await connectWallet();
    // Only toast on success (error is shown via the error banner).
    if (!error) {
      addToast({ message: 'Wallet connected successfully!', type: 'success' });
    }
  };

  // Disconnect wallet handler
  const handleDisconnect = () => {
    disconnectWallet();
    setContractResult(null);
    addToast({ message: 'Wallet disconnected.', type: 'info' });
  };

  // Sign message for authentication
  const handleSignMessage = async () => {
    const result = await authenticateWithSignature();
    if (result) {
      addToast({ message: 'Message signed! Signature ready for backend.', type: 'success' });
      console.log('Auth payload for backend:', result);
    }
  };

  // Read from smart contract example
  const handleReadContract = async () => {
    const name = await readContractExample();
    if (name) {
      setContractResult(name);
      addToast({ message: `Contract read: ${name}`, type: 'success' });
    }
  };

  // Connected state
  if (isConnected) {
    return (
      <div className="auth-container">
        <div className="auth-box">
          <div className="wallet-success">
            <div className="success-icon">✅</div>
            <h2 className="auth-title">Wallet Connected</h2>
            <p className="wallet-address">{shortenAddress(account)}</p>

            {/* Error banner */}
            {error && (
              <div className="error-banner">
                <span>{error}</span>
                <button onClick={clearError} className="error-dismiss">×</button>
              </div>
            )}

            {/* Wrong network warning */}
            {isWrongNetwork && (
              <div className="network-warning">
                ⚠️ Please switch to <strong>{requiredChainName}</strong> for full functionality.
              </div>
            )}

            <div className="wallet-info">
              <div className="info-item">
                <span className="info-label">Network</span>
                <span className="info-value">{network || 'Unknown'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Status</span>
                <span className="info-value">
                  <span className="status-dot status-connected"></span>
                  Connected
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Address</span>
                <span className="info-value" style={{ fontFamily: "'Courier New', monospace", fontSize: 12 }}>
                  {account}
                </span>
              </div>
              {contractResult && (
                <div className="info-item">
                  <span className="info-label">Contract</span>
                  <span className="info-value">{contractResult}</span>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <button className="btn btn-primary sign-btn" onClick={handleSignMessage}>
              🔏 Sign Message (Authenticate)
            </button>

            <button className="btn btn-secondary contract-btn" onClick={handleReadContract}>
              📄 Read Smart Contract
            </button>

            <button
              className="btn btn-primary btn-full"
              onClick={() => window.location.href = '/dashboard'}
            >
              Go to Dashboard
            </button>

            <button
              className="btn btn-secondary btn-full"
              onClick={handleDisconnect}
              style={{ marginTop: '12px' }}
            >
              Disconnect Wallet
            </button>
          </div>
        </div>

        <div className="auth-background">
          <div className="background-shape shape-1"></div>
          <div className="background-shape shape-2"></div>
          <div className="background-shape shape-3"></div>
        </div>
      </div>
    );
  }

  // Disconnected state
  return (
    <div className="auth-container">
      <div className="auth-box wallet-connect-box">
        <div className="auth-header">
          <h1 className="auth-logo">GovChain</h1>
          <h2 className="auth-title">Connect Your Wallet</h2>
          <p className="auth-subtitle">
            {isMetaMaskInstalled
              ? 'Click below to connect your MetaMask wallet'
              : 'MetaMask extension is required to continue'}
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div className="error-banner">
            <span>{error}</span>
            <button onClick={clearError} className="error-dismiss">×</button>
          </div>
        )}

        {loading ? (
          // Loading spinner
          <div className="connecting-state">
            <div className="spinner"></div>
            <p>Connecting to MetaMask…</p>
            <p className="connecting-hint">Approve the request in the MetaMask popup</p>
          </div>
        ) : (
          <>
            {/* MetaMask connect card */}
            <div className="wallet-grid" style={{ gridTemplateColumns: '1fr' }}>
              <button
                className="wallet-option"
                onClick={handleConnect}
                disabled={!isMetaMaskInstalled}
                style={{ opacity: isMetaMaskInstalled ? 1 : 0.5 }}
              >
                <span className="popular-badge">Recommended</span>
                <div className="wallet-icon-large">🦊</div>
                <h3 className="wallet-name">MetaMask</h3>
                <p className="wallet-description">
                  {isMetaMaskInstalled
                    ? 'Connect using MetaMask browser extension'
                    : 'MetaMask is not installed — install it from metamask.io'}
                </p>
              </button>
            </div>

            <div className="wallet-info-box">
              <h4>Why connect a wallet?</h4>
              <ul>
                <li>✓ Participate in governance votes</li>
                <li>✓ Create and submit proposals</li>
                <li>✓ View your voting power and history</li>
                <li>✓ Access treasury and rewards</li>
              </ul>
            </div>

            <p className="auth-footer">
              New to wallets?{' '}
              <a
                href="https://metamask.io/download/"
                target="_blank"
                rel="noopener noreferrer"
                className="auth-link"
              >
                Install MetaMask →
              </a>
            </p>

            <p className="auth-footer">
              <a href="/login" className="auth-link">← Back to Login</a>
            </p>
          </>
        )}
      </div>

      <div className="auth-background">
        <div className="background-shape shape-1"></div>
        <div className="background-shape shape-2"></div>
        <div className="background-shape shape-3"></div>
      </div>
    </div>
  );
}