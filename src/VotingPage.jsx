import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useContract } from "./hooks/useContract";
import "./voting.css";

export default function VotingPage() {
  const navigate = useNavigate();
  const {
    connected,
    loading,
    error,
    accounts,
    activeAccount,
    connect,
    switchAccount,
    fetchProposals,
    castVote,
  } = useContract();

  const [proposals, setProposals] = useState([]);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [voting, setVoting] = useState(false);
  const [voteError, setVoteError] = useState("");
  const [voteSuccess, setVoteSuccess] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // Fetch proposals when connected or account changes
  const loadProposals = useCallback(async () => {
    if (!connected) return;
    setRefreshing(true);
    const data = await fetchProposals();
    setProposals(data);
    // Refresh selected proposal too
    if (selectedProposal) {
      const updated = data.find((p) => p.id === selectedProposal.id);
      if (updated) setSelectedProposal(updated);
    }
    setRefreshing(false);
  }, [connected, fetchProposals, selectedProposal?.id]);

  useEffect(() => {
    loadProposals();
  }, [connected, activeAccount]);

  // Handle vote
  const handleVote = async (proposalId, candidateIndex, candidateName) => {
    setVoting(true);
    setVoteError("");
    setVoteSuccess("");
    try {
      await castVote(proposalId, candidateIndex);
      setVoteSuccess(`Vote cast for "${candidateName}" successfully!`);
      await loadProposals();
    } catch (err) {
      const msg = err.message || "";
      if (msg.includes("Already voted")) {
        setVoteError("You have already voted on this proposal.");
      } else if (msg.includes("not active")) {
        setVoteError("This proposal is no longer active.");
      } else if (msg.includes("Voting period has ended")) {
        setVoteError("The voting period has ended.");
      } else {
        setVoteError("Vote failed: " + msg.slice(0, 100));
      }
    } finally {
      setVoting(false);
    }
  };

  // Format timestamp
  const formatTime = (ts) => {
    if (!ts) return "—";
    return new Date(ts * 1000).toLocaleString();
  };

  // Calculate time remaining
  const timeRemaining = (endTime) => {
    const now = Date.now() / 1000;
    const diff = endTime - now;
    if (diff <= 0) return "Ended";
    const days = Math.floor(diff / 86400);
    const hours = Math.floor((diff % 86400) / 3600);
    if (days > 0) return `${days}d ${hours}h remaining`;
    const mins = Math.floor((diff % 3600) / 60);
    return `${hours}h ${mins}m remaining`;
  };

  // Get vote bar percentage
  const getVotePercent = (voteCount, totalVotes) => {
    if (totalVotes === 0) return 0;
    return Math.round((voteCount / totalVotes) * 100);
  };

  // ── Not Connected ──────────────────────────────────────────────

  if (!connected && !loading) {
    return (
      <div className="vote-page">
        <nav className="vote-nav">
          <div className="vote-nav-inner">
            <span className="vote-logo" onClick={() => navigate("/")}>
              GovChain
            </span>
            <span className="vote-nav-badge">Voting Demo</span>
          </div>
        </nav>
        <div className="vote-connect-screen">
          <div className="vote-connect-card">
            <div className="vote-connect-icon">🔗</div>
            <h2>Connect to Local Blockchain</h2>
            <p>Start the Hardhat node and deploy the contract first:</p>
            <div className="vote-code-block">
              <code>npx hardhat --config hardhat.config.cjs node</code>
              <code>
                npx hardhat --config hardhat.config.cjs run scripts/deploy.cjs
                --network localhost
              </code>
            </div>
            {error && <div className="vote-error-box">{error}</div>}
            <button className="vote-btn-primary" onClick={connect}>
              Connect to Hardhat Node
            </button>
            <button
              className="vote-btn-secondary"
              onClick={() => navigate("/")}
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Loading ────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="vote-page">
        <div className="vote-connect-screen">
          <div className="vote-connect-card">
            <div className="vote-spinner" />
            <p>Connecting to Hardhat node...</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Main Voting UI ─────────────────────────────────────────────

  return (
    <div className="vote-page">
      {/* Top Nav */}
      <nav className="vote-nav">
        <div className="vote-nav-inner">
          <span className="vote-logo" onClick={() => navigate("/")}>
            GovChain
          </span>
          <div className="vote-nav-right">
            <span className="vote-nav-badge">Voting Demo</span>
            <span className="vote-connection-dot" />
            <span className="vote-connection-text">Hardhat Local</span>
          </div>
        </div>
      </nav>

      <div className="vote-container">
        {/* Account Selector */}
        <div className="vote-account-bar">
          <div className="vote-account-label">
            <span className="vote-account-icon">👤</span>
            Active Account:
          </div>
          <select
            className="vote-account-select"
            value={activeAccount?.index ?? 0}
            onChange={(e) => switchAccount(Number(e.target.value))}
          >
            {accounts.map((acc) => (
              <option key={acc.index} value={acc.index}>
                {acc.label} — {acc.address.slice(0, 6)}...
                {acc.address.slice(-4)} ({Number(acc.balance).toFixed(0)} ETH)
              </option>
            ))}
          </select>
          <button
            className="vote-btn-refresh"
            onClick={loadProposals}
            disabled={refreshing}
            title="Refresh proposals"
          >
            {refreshing ? "⟳" : "🔄"}
          </button>
        </div>

        {/* Two-column layout */}
        <div className="vote-layout">
          {/* Left: Proposal List */}
          <div className="vote-sidebar">
            <h3 className="vote-sidebar-title">
              Proposals ({proposals.length})
            </h3>
            {proposals.length === 0 && (
              <p className="vote-empty">
                No proposals found. Deploy the contract first.
              </p>
            )}
            {proposals.map((p) => (
              <div
                key={p.id}
                className={`vote-proposal-card ${selectedProposal?.id === p.id ? "active" : ""}`}
                onClick={() => {
                  setSelectedProposal(p);
                  setVoteError("");
                  setVoteSuccess("");
                }}
              >
                <div className="vote-proposal-header">
                  <span
                    className={`vote-status-badge ${p.active ? "active" : "ended"}`}
                  >
                    {p.active ? "● Active" : "○ Ended"}
                  </span>
                  <span className="vote-proposal-id">#{p.id}</span>
                </div>
                <h4 className="vote-proposal-title">{p.title}</h4>
                <div className="vote-proposal-meta">
                  <span>🗳️ {p.totalVotes} votes</span>
                  <span>👥 {p.candidates.length} candidates</span>
                </div>
                <div className="vote-proposal-time">
                  {timeRemaining(p.endTime)}
                </div>
                {p.hasVoted && (
                  <div className="vote-voted-tag">✓ You voted</div>
                )}
              </div>
            ))}
          </div>

          {/* Right: Proposal Detail + Voting */}
          <div className="vote-main">
            {!selectedProposal ? (
              <div className="vote-placeholder">
                <div className="vote-placeholder-icon">🗳️</div>
                <h3>Select a proposal to vote</h3>
                <p>
                  Click on any proposal from the left to see details and cast
                  your vote.
                </p>
              </div>
            ) : (
              <div className="vote-detail">
                {/* Header */}
                <div className="vote-detail-header">
                  <div>
                    <span
                      className={`vote-status-badge big ${selectedProposal.active ? "active" : "ended"}`}
                    >
                      {selectedProposal.active ? "● Active" : "○ Ended"}
                    </span>
                    <h2 className="vote-detail-title">
                      {selectedProposal.title}
                    </h2>
                    <p className="vote-detail-desc">
                      {selectedProposal.description}
                    </p>
                  </div>
                </div>

                {/* Info Row */}
                <div className="vote-info-row">
                  <div className="vote-info-item">
                    <span className="vote-info-label">Start</span>
                    <span className="vote-info-value">
                      {formatTime(selectedProposal.startTime)}
                    </span>
                  </div>
                  <div className="vote-info-item">
                    <span className="vote-info-label">End</span>
                    <span className="vote-info-value">
                      {formatTime(selectedProposal.endTime)}
                    </span>
                  </div>
                  <div className="vote-info-item">
                    <span className="vote-info-label">Total Votes</span>
                    <span className="vote-info-value">
                      {selectedProposal.totalVotes}
                    </span>
                  </div>
                  <div className="vote-info-item">
                    <span className="vote-info-label">Time Left</span>
                    <span className="vote-info-value">
                      {timeRemaining(selectedProposal.endTime)}
                    </span>
                  </div>
                </div>

                {/* Feedback */}
                {voteError && <div className="vote-error-box">{voteError}</div>}
                {voteSuccess && (
                  <div className="vote-success-box">{voteSuccess}</div>
                )}
                {selectedProposal.hasVoted && !voteSuccess && (
                  <div className="vote-info-box">
                    ✅ You have already voted on this proposal. Switch accounts
                    to vote again.
                  </div>
                )}

                {/* Candidates */}
                <h3 className="vote-candidates-title">Candidates & Results</h3>
                <div className="vote-candidates-grid">
                  {selectedProposal.candidates.map((c) => {
                    const pct = getVotePercent(
                      c.voteCount,
                      selectedProposal.totalVotes,
                    );
                    return (
                      <div key={c.index} className="vote-candidate-card">
                        <div className="vote-candidate-top">
                          <div className="vote-candidate-avatar">
                            {c.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="vote-candidate-info">
                            <h4>{c.name}</h4>
                            <span className="vote-candidate-votes">
                              {c.voteCount} vote{c.voteCount !== 1 ? "s" : ""}
                            </span>
                          </div>
                          {selectedProposal.active &&
                            !selectedProposal.hasVoted && (
                              <button
                                className="vote-btn-vote"
                                disabled={voting}
                                onClick={() =>
                                  handleVote(
                                    selectedProposal.id,
                                    c.index,
                                    c.name,
                                  )
                                }
                              >
                                {voting ? "..." : "Vote"}
                              </button>
                            )}
                        </div>
                        <div className="vote-bar-track">
                          <div
                            className="vote-bar-fill"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="vote-bar-label">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
