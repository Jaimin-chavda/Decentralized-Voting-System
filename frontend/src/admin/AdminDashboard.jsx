import React, { useState } from "react";
import { DEMO_ADMIN } from "../data/demoData";
import { useProposals } from "../context/ProposalContext";
import ProposalManager from "./ProposalManager";
import CandidateManager from "./CandidateManager";
import { useToast } from "../utils/toast";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1 },
  }),
};

export default function AdminDashboard() {
  const { isAuthenticated, isAdmin, login, logout, user } = useAuth();
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [activeTab, setActiveTab] = useState("proposals");
  const { proposals, setProposals } = useProposals();
  const { addToast } = useToast();

  const totalProposals = proposals.length;
  const activeProposals = proposals.filter((p) => p.status === "active").length;
  const totalCandidates = proposals.reduce(
    (s, p) => s + (p.candidates?.length || 0),
    0
  );
  const totalVotes = proposals.reduce(
    (s, p) => s + (p.candidates || []).reduce((vs, c) => vs + c.votes, 0),
    0
  );

  const handleLogin = async (e) => {
    e.preventDefault();
    const result = await login(loginEmail, loginPassword);
    if (result.success && (String(result.role || "").includes("ADMIN") || result.role === "admin")) {
      setLoginError("");
      addToast({ message: "Welcome, Admin!", type: "success" });
    } else {
      setLoginError(result.error || "Invalid admin credentials.");
    }
  };

  const handleLogout = () => {
    logout();
    setLoginEmail("");
    setLoginPassword("");
    addToast({ message: "Logged out.", type: "info" });
  };

  if (!isAuthenticated || !isAdmin) {
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
          className="relative w-full max-w-md"
        >
          <motion.div
            variants={fadeUp}
            className="glass rounded-3xl p-8 lg:p-10 shadow-2xl shadow-black/20"
          >
            <div className="text-center mb-8">
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 mb-5 group"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-8 h-8 text-primary"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="9 11 12 14 22 4"></polyline>
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                </svg>
                <span className="text-xl font-bold text-text-primary">
                  VoteChain
                </span>
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  ADMIN
                </span>
              </Link>
              <h1 className="text-2xl font-bold text-text-primary mb-1">
                Admin Panel
              </h1>
              <p className="text-sm text-text-muted">
                Sign in to manage proposals & candidates
              </p>
            </div>

            {loginError && (
              <div className="mb-5 p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm">
                {loginError}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="admin@votechain.io"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-border rounded-xl text-text-primary placeholder-text-muted/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="admin123"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-border rounded-xl text-text-primary placeholder-text-muted/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all duration-200"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-text-muted cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-border bg-white/5 accent-primary"
                  />
                  Remember me
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 text-sm font-semibold text-white bg-gradient-to-r from-primary to-accent rounded-xl hover:shadow-lg hover:shadow-primary/25 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300"
              >
                Sign In
              </button>
            </form>

            <div className="mt-5 p-3 rounded-xl bg-primary/5 border border-primary/10 text-xs text-text-muted">
              <strong className="text-primary">Demo:</strong>{" "}
              admin@votechain.io / admin123
            </div>

            <p className="text-center text-sm text-text-muted mt-6">
              Go back to{" "}
              <Link
                to="/"
                className="text-primary font-semibold hover:underline"
              >
                Homepage
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-dark text-text-primary p-6 lg:p-10 relative overflow-x-hidden">
      {/* Background glow logic to match theme */}
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[128px] animate-glow pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Top Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 pb-6 border-b border-border">
          <Link to="/" className="inline-flex items-center gap-2 group">
             <svg
                viewBox="0 0 24 24"
                className="w-8 h-8 text-primary"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 11 12 14 22 4"></polyline>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
              </svg>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
              VoteChain
            </h1>
            <span className="ml-2 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
              ADMIN
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <span className="text-text-muted text-sm font-medium px-4 py-2 glass rounded-xl">
              👤 {user?.name || DEMO_ADMIN.name}
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-semibold text-danger hover:text-white bg-danger/10 hover:bg-danger rounded-xl transition-all duration-200"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Stats Row */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Total Proposals", value: totalProposals, icon: "📋", c: "from-blue-500/20 to-blue-500/5", t: "text-blue-400" },
            { label: "Active", value: activeProposals, icon: "✅", c: "from-emerald-500/20 to-emerald-500/5", t: "text-emerald-400" },
            { label: "Candidates", value: totalCandidates, icon: "👥", c: "from-purple-500/20 to-purple-500/5", t: "text-purple-400" },
            { label: "Total Votes", value: totalVotes, icon: "🗳️", c: "from-amber-500/20 to-amber-500/5", t: "text-amber-400" },
          ].map((s, i) => (
            <div key={i} className="glass rounded-2xl p-6 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.c} border border-white/5 flex items-center justify-center text-xl`}>
                {s.icon}
              </div>
              <div>
                <div className={`text-2xl font-extrabold ${s.t}`}>{s.value}</div>
                <div className="text-xs text-text-muted uppercase tracking-wider font-semibold">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Space main content */}
        <div className="glass rounded-3xl p-6 lg:p-8">
          <div className="flex gap-2 mb-8 border-b border-border pb-4">
            <button
              className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeTab === "proposals" 
                  ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/20" 
                  : "text-text-muted hover:text-text-primary hover:bg-white/5"
              }`}
              onClick={() => setActiveTab("proposals")}
            >
              📋 Manage Proposals
            </button>
            <button
              className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeTab === "candidates" 
                  ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/20" 
                  : "text-text-muted hover:text-text-primary hover:bg-white/5"
              }`}
              onClick={() => setActiveTab("candidates")}
            >
              👥 Manage Candidates
            </button>
          </div>

          <div className="min-h-[400px]">
            {activeTab === "proposals" && (
              <ProposalManager
                proposals={proposals}
                setProposals={setProposals}
              />
            )}
            {activeTab === "candidates" && (
              <CandidateManager
                proposals={proposals}
                setProposals={setProposals}
              />
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
