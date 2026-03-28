import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import useWallet, { shortenAddress } from "./hooks/useWallet";
import { useAuth } from "./context/AuthContext";
import { useToast } from "./utils/toast";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1 },
  }),
};

export default function WalletConnect() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Allow wallet connection without requiring email/password authentication first
  const {
    account,
    network,
    loading,
    error,
    isConnected,
    isMobileDevice,
    isMetaMaskInstalled,
    canDeepLinkMetaMask,
    mobileDeepLinkBlocked,
    isWrongNetwork,
    requiredChainName,
    connectWallet,
    disconnectWallet,
    authenticateWithSignature,
    readContractExample,
    switchNetwork,
    clearError,
    redirectToMetaMask,
  } = useWallet();

  const { addToast } = useToast();
  const [contractResult, setContractResult] = useState(null);
  const [detecting, setDetecting] = useState(true);
  const canConnect = isMetaMaskInstalled || canDeepLinkMetaMask;

  // Authenticated guard — Wallet connection is only permitted after sign-in.
  useEffect(() => {
    if (!isAuthenticated) {
      addToast({ message: "Please sign in first to connect your wallet.", type: "warning" });
      navigate("/login?redirect=/wallet-connect");
    }
  }, [isAuthenticated, navigate, addToast]);

  // ─── Auto-detect MetaMask (check only, no connect) ───
  useEffect(() => {
    // Give the browser 600ms to inject window.ethereum
    const timer = setTimeout(() => setDetecting(false), 600);
    return () => clearTimeout(timer);
  }, []);

  // ─── Handlers ────────────────────────────────────
  const handleConnect = async () => {
    clearError();
    await connectWallet();
    // connectWallet shows the MetaMask popup via eth_requestAccounts
  };

  // Show toast when connection succeeds
  useEffect(() => {
    if (isConnected && account) {
      addToast({
        message: `Wallet connected: ${shortenAddress(account)}`,
        type: "success",
      });
    }
  }, [isConnected]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDisconnect = () => {
    disconnectWallet();
    setContractResult(null);
    addToast({ message: "Wallet disconnected.", type: "info" });
  };

  const handleSignMessage = async () => {
    const result = await authenticateWithSignature();
    if (result) {
      addToast({ message: "Message signed successfully!", type: "success" });
      console.log("Auth payload for backend:", result);
    }
  };

  const handleReadContract = async () => {
    const name = await readContractExample();
    if (name) {
      setContractResult(name);
      addToast({ message: `Contract read: ${name}`, type: "success" });
    }
  };

  // ─── Detecting State ──────────────────────────────
  if (detecting) {
    return (
      <div className="min-h-screen bg-bg-dark flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 mx-auto mb-6 border-4 border-border border-t-primary rounded-full animate-spin" />
          <p className="text-text-primary font-medium text-lg">
            Detecting Wallet…
          </p>
          <p className="text-sm text-text-muted mt-2">
            Checking your browser for MetaMask
          </p>
        </motion.div>
      </div>
    );
  }

  // ─── Connected State ──────────────────────────────
  if (isConnected) {
    return (
      <div className="min-h-screen bg-bg-dark flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-success/10 rounded-full blur-[128px] animate-glow pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="relative w-full max-w-md"
        >
          <div className="glass rounded-3xl p-8 lg:p-10 shadow-2xl shadow-black/20 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 15,
                delay: 0.1,
              }}
              className="w-16 h-16 mx-auto mb-4 rounded-full bg-success/10 flex items-center justify-center text-3xl"
            >
              ✅
            </motion.div>
            <h2 className="text-2xl font-bold text-text-primary mb-1">
              Wallet Connected
            </h2>
            <p className="text-primary font-mono text-sm mb-6">
              {shortenAddress(account)}
            </p>

            {isMobileDevice && !window.ethereum?.isMetaMask && (
              <div className="mb-6 p-4 rounded-xl bg-primary/5 border border-primary/20 text-left">
                <p className="text-xs text-text-muted mb-3 italic">
                  Tip: You are connected, but not inside the MetaMask in-app browser. For the best experience on mobile, use the MetaMask app.
                </p>
                <button
                  onClick={redirectToMetaMask}
                  className="w-full py-2 text-xs font-bold text-primary border border-primary/30 rounded-lg hover:bg-primary/10 transition-all"
                >
                  🚀 Open in MetaMask App
                </button>
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm flex items-center justify-between">
                <span>{error}</span>
                <button
                  onClick={clearError}
                  className="text-lg leading-none ml-2"
                >
                  ×
                </button>
              </div>
            )}

            {isWrongNetwork && (
              <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm text-left flex flex-col gap-2">
                <span>
                  ⚠️ Wrong network. Please switch to{" "}
                  <strong>{requiredChainName}</strong>.
                </span>
                <button
                  onClick={switchNetwork}
                  className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 rounded-lg text-xs font-bold transition-all w-fit border border-amber-500/30 shadow-sm"
                >
                  Switch Network Automatically
                </button>
              </div>
            )}

            {/* Info Grid */}
            <div className="rounded-xl bg-white/5 border border-border divide-y divide-border mb-6 text-left">
              <div className="flex justify-between items-center px-4 py-3">
                <span className="text-sm text-text-muted">Network</span>
                <span
                  className={`text-sm font-semibold ${
                    isWrongNetwork ? "text-amber-400" : "text-text-primary"
                  }`}
                >
                  {network || "Unknown"}
                </span>
              </div>
              <div className="flex justify-between items-center px-4 py-3">
                <span className="text-sm text-text-muted">Status</span>
                <span className="text-sm font-semibold text-success flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-success shadow-[0_0_6px_rgba(34,197,94,0.5)] animate-pulse" />
                  Connected
                </span>
              </div>
              <div className="flex justify-between items-center px-4 py-3">
                <span className="text-sm text-text-muted">Wallet</span>
                <span className="text-xs font-mono text-text-muted">
                  🦊 MetaMask
                </span>
              </div>
              <div className="flex justify-between items-center px-4 py-3">
                <span className="text-sm text-text-muted">Address</span>
                <span className="text-xs font-mono text-text-muted break-all">
                  {account}
                </span>
              </div>
              {contractResult && (
                <div className="flex justify-between items-center px-4 py-3">
                  <span className="text-sm text-text-muted">Contract</span>
                  <span className="text-sm font-semibold text-text-primary">
                    {contractResult}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <button
                onClick={handleSignMessage}
                className="w-full py-3 text-sm font-semibold text-white bg-gradient-to-r from-primary to-accent rounded-xl hover:shadow-lg hover:shadow-primary/25 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300"
              >
                🔏 Sign Message (Authenticate)
              </button>
              <button
                onClick={handleReadContract}
                className="w-full py-3 text-sm font-semibold text-text-primary glass rounded-xl hover:bg-white/[0.08] transition-all duration-300"
              >
                📄 Read Smart Contract
              </button>
              <Link
                to="/"
                className="block w-full py-3 text-sm font-semibold text-white bg-gradient-to-r from-primary to-accent rounded-xl hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 text-center"
              >
                Go to Homepage
              </Link>
              <button
                onClick={handleDisconnect}
                className="w-full py-3 text-sm font-semibold text-text-muted glass rounded-xl hover:bg-white/[0.08] hover:text-danger transition-all duration-300"
              >
                Disconnect Wallet
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── Disconnected — User must click to connect ────
  return (
    <div className="min-h-screen bg-bg-dark flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[128px] animate-glow pointer-events-none" />
      <div
        className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] bg-accent/10 rounded-full blur-[128px] animate-glow pointer-events-none"
        style={{ animationDelay: "1.5s" }}
      />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
        className="relative w-full max-w-lg"
      >
        <motion.div
          variants={fadeUp}
          className="glass rounded-3xl p-8 lg:p-10 shadow-2xl shadow-black/20"
        >
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-5 group">
              <svg viewBox="0 0 24 24" className="w-8 h-8 text-primary" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
  <polyline points="9 11 12 14 22 4"></polyline>
  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
</svg>
              <span className="text-xl font-bold text-text-primary">
                VoteChain
              </span>
            </Link>
            <h1 className="text-2xl font-bold text-text-primary mb-1">
              Connect Your Wallet
            </h1>
            <p className="text-sm text-text-muted">
              {isMetaMaskInstalled
                ? "MetaMask detected! Click below to open the MetaMask popup and approve the connection."
                : isMobileDevice
                  ? mobileDeepLinkBlocked
                    ? "Mobile browser detected, but this URL is localhost. Open the app using your computer's LAN IP instead."
                    : "Mobile browser detected. Tap connect to open this site in the MetaMask app."
                  : "MetaMask extension was not found in your browser. Install it first."}
            </p>
          </div>

          {/* Detection Status Banner */}
          <div
            className={`mb-6 p-4 rounded-xl border text-sm flex items-center gap-3 ${
              canConnect
                ? "bg-success/5 border-success/20 text-success"
                : "bg-danger/5 border-danger/20 text-danger"
            }`}
          >
            <span className="text-lg">{canConnect ? "🦊" : "❌"}</span>
            <div>
              <div className="font-medium">
                {isMetaMaskInstalled
                  ? "MetaMask Detected"
                  : canDeepLinkMetaMask
                    ? "MetaMask Mobile Ready"
                    : mobileDeepLinkBlocked
                      ? "Mobile URL Not Reachable"
                    : "MetaMask Not Found"}
              </div>
              <div className="text-xs opacity-90 mt-1 space-y-1">
                {isMetaMaskInstalled
                  ? "Your browser has a Web3 provider. Click the button below to connect."
                  : canDeepLinkMetaMask
                    ? "You can open this dapp directly in the MetaMask app on your phone."
                    : mobileDeepLinkBlocked
                      ? "Localhost URLs are not reachable inside MetaMask mobile. Use a LAN IP (e.g. 192.168.x.x) or a live URL."
                    : "Install MetaMask from metamask.io to continue."}
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm flex items-center justify-between">
              <span>{error}</span>
              <button
                onClick={clearError}
                className="text-lg leading-none ml-2"
              >
                ×
              </button>
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 mx-auto mb-4 border-4 border-border border-t-primary rounded-full animate-spin" />
              <p className="text-text-primary font-medium">
                Waiting for MetaMask…
              </p>
              <p className="text-sm text-text-muted mt-1">
                A MetaMask popup should have appeared — approve it to connect.
              </p>
            </div>
          ) : (
            <>
              {/* MetaMask Connect Button */}
              <button
                onClick={handleConnect}
                disabled={!canConnect}
                className={`w-full p-6 rounded-2xl border text-center transition-all duration-300 mb-6 relative group ${
                  canConnect
                    ? "glass hover:bg-white/[0.08] hover:border-primary/30 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10 cursor-pointer"
                    : "bg-white/[0.02] border-border/50 opacity-50 cursor-not-allowed"
                }`}
              >
                {canConnect && (
                  <span className="absolute top-3 right-3 text-[10px] font-bold text-success bg-success/10 px-2 py-1 rounded-lg uppercase tracking-wider">
                    Ready
                  </span>
                )}
                <div className="text-5xl mb-3">🦊</div>
                <h3 className="text-lg font-bold text-text-primary mb-1">
                  {canDeepLinkMetaMask ? "Open in MetaMask" : "MetaMask"}
                </h3>
                <p className="text-sm text-text-muted">
                  {isMetaMaskInstalled
                    ? "Click to open MetaMask popup and select your account"
                    : canDeepLinkMetaMask
                      ? "Tap to launch the MetaMask app and continue there"
                      : "Extension not detected — install from metamask.io"}
                </p>
                {canConnect && (
                  <div className="mt-3 inline-flex items-center gap-2 text-xs text-primary font-semibold">
                    {canDeepLinkMetaMask ? "Tap to open MetaMask App →" : "Click to connect →"}
                  </div>
                )}
              </button>

              {/* Explicit Mobile Helper for Brave/etc users */}
              {isMobileDevice && isMetaMaskInstalled && !window.ethereum?.isMetaMask && (
                <div className="mb-6 p-4 rounded-2xl glass border-primary/20 text-center">
                  <p className="text-xs text-text-muted mb-3">
                    Detected a mobile browser with its own wallet (like Brave). If you prefer using the <strong>MetaMask App</strong>, tap below:
                  </p>
                  <button
                    onClick={redirectToMetaMask}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold rounded-xl border border-primary/20 transition-all"
                  >
                    🦊 Open MetaMask App instead
                  </button>
                </div>
              )}

              {/* WalletConnect placeholder */}
              <div className="w-full p-5 rounded-2xl border border-border/30 bg-white/[0.01] text-center mb-6 opacity-40 cursor-not-allowed">
                <div className="text-3xl mb-2">🔗</div>
                <h3 className="text-sm font-bold text-text-primary mb-0.5">
                  WalletConnect
                </h3>
                <p className="text-xs text-text-muted">Coming soon</p>
              </div>

              {/* Why connect */}
              <div className="rounded-xl bg-white/5 border border-border p-5 mb-6">
                <h4 className="text-sm font-semibold text-text-primary mb-3">
                  Why connect a wallet?
                </h4>
                <ul className="space-y-2">
                  {[
                    "Participate in real on-chain governance votes",
                    "Create and submit proposals to the smart contract",
                    "View your token holdings and voting power",
                    "Sign messages for secure authentication",
                  ].map((item) => (
                    <li
                      key={item}
                      className="text-sm text-text-muted flex items-center gap-2"
                    >
                      <span className="text-success">✓</span> {item}
                    </li>
                  ))}
                </ul>
              </div>

              {!isMetaMaskInstalled && (
                <a
                  href={
                    isMobileDevice
                      ? "https://metamask.app.link/"
                      : "https://metamask.io/download/"
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full py-3 text-sm font-semibold text-white bg-gradient-to-r from-primary to-accent rounded-xl hover:shadow-lg hover:shadow-primary/25 text-center transition-all duration-300 mb-4"
                >
                  {isMobileDevice
                    ? "Install MetaMask App →"
                    : "Install MetaMask Extension →"}
                </a>
              )}

              <p className="text-center text-sm text-text-muted">
                <Link
                  to="/login"
                  className="text-primary font-semibold hover:underline"
                >
                  ← Back to Login
                </Link>
              </p>
            </>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
