import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useContract } from "./hooks/useContract";
import { useProposals } from "./context/ProposalContext";
import { useAuth } from "./context/AuthContext";
import "./voting.css";

export default function VotingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const {
    connected,
    loading: walletLoading,
    error: walletError,
    activeAccount,
    connect,
  } = useContract();

  const {
    proposals,
    loading: proposalsLoading,
    fetchProposals,
    castVote: castDbVote,
  } = useProposals();

  const [selectedProposal, setSelectedProposal] = useState(null);
  const [voting, setVoting] = useState(false);
  const [voteError, setVoteError] = useState("");
  const [voteSuccess, setVoteSuccess] = useState("");

  useEffect(() => {
    if (selectedProposal) {
      const updated = proposals.find((p) => p.id === selectedProposal.id);
      if (updated) setSelectedProposal(updated);
    }
  }, [proposals, selectedProposal]);

  const handleVote = async (proposalId, candidateId, candidateName) => {
    if (!isAuthenticated) {
      setVoteError("Please login before voting.");
      return;
    }

    if (!connected) {
      setVoteError("Please connect your wallet before voting.");
      return;
    }

    setVoting(true);
    setVoteError("");
    setVoteSuccess("");

    try {
      const success = await castDbVote(proposalId, candidateId);
      if (success) {
        setVoteSuccess(`Vote cast for "${candidateName}" successfully!`);
      }
    } catch (err) {
      const message = String(err?.message || "");
      if (message.toLowerCase().includes("no token")) {
        setVoteError("Your login session expired. Please login again.");
      } else {
        setVoteError("Vote failed: " + message);
      }
    } finally {
      setVoting(false);
    }
  };

  const formatDate = (ts) => {
    if (!ts) return "-";
    if (ts && typeof ts === "object" && ts.seconds) {
      return new Date(ts.seconds * 1000).toLocaleString();
    }
    return new Date(ts).toLocaleString();
  };

  const getTimeRemaining = (endTime) => {
    if (!endTime) return "N/A";

    const end = new Date(endTime).getTime();
    const now = Date.now();
    const diff = end - now;

    if (diff <= 0) return "Ended";

    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    if (days > 0) return `${days}d ${hours}h remaining`;

    const mins = Math.floor((diff % 3600000) / 60000);
    return `${hours}h ${mins}m remaining`;
  };

  const getVotePercent = (voteCount, totalVotes) => {
    if (totalVotes === 0) return 0;
    return Math.round((voteCount / totalVotes) * 100);
  };

  if (!isAuthenticated) {
    return (
      <div className="vote-page">
        <nav className="vote-nav">
          <div className="vote-nav-inner">
            <span className="vote-logo" onClick={() => navigate("/")}>
              VoteChain
            </span>
          </div>
        </nav>
        <div className="vote-connect-screen">
          <div className="vote-connect-card">
            <div className="vote-connect-icon">Login</div>
            <h2>Login Required</h2>
            <p>Please sign in first. After login, connect MetaMask to vote.</p>
            <button
              className="vote-btn-primary"
              onClick={() => navigate("/login")}
            >
              Login to Continue
            </button>
            <button
              className="vote-btn-secondary"
              onClick={() => navigate("/")}
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!connected && !walletLoading) {
    return (
      <div className="vote-page">
        <nav className="vote-nav">
          <div className="vote-nav-inner">
            <span className="vote-logo" onClick={() => navigate("/")}>
              VoteChain
            </span>
          </div>
        </nav>
        <div className="vote-connect-screen">
          <div className="vote-connect-card">
            <div className="vote-connect-icon">Wallet</div>
            <h2>Connect Your Wallet</h2>
            <p>
              Logged in as {user?.name || user?.email || "user"}. Connect your
              MetaMask wallet to cast your vote.
            </p>
            {walletError && <div className="vote-error-box">{walletError}</div>}
            <button className="vote-btn-primary" onClick={connect}>
              Connect Wallet
            </button>
            <button
              className="vote-btn-secondary"
              onClick={() => navigate("/")}
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (walletLoading || (proposalsLoading && proposals.length === 0)) {
    return (
      <div className="vote-page">
        <div className="vote-connect-screen">
          <div className="vote-connect-card">
            <div className="vote-spinner" />
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="vote-page">
      <nav className="vote-nav">
        <div className="vote-nav-inner">
          <span className="vote-logo" onClick={() => navigate("/")}>
            VoteChain
          </span>
          <div className="vote-nav-right">
            <span className="vote-connection-dot" />
            <span className="vote-connection-text">Connected via MetaMask</span>
          </div>
        </div>
      </nav>

      <div className="vote-container">
        <div className="vote-account-bar">
          <div className="vote-account-label">
            <span className="vote-account-icon">User</span>
            Active Session:
          </div>
          <div className="vote-account-display text-sm font-semibold text-text-primary px-4 py-2 rounded-lg bg-white/5 border border-white/10">
            {user?.name || user?.email || "Logged in"}
          </div>
          {activeAccount && (
            <div className="vote-account-display text-sm font-semibold text-text-primary px-4 py-2 rounded-lg bg-white/5 border border-white/10">
              {activeAccount.address.slice(0, 6)}...
              {activeAccount.address.slice(-4)}
              <span className="text-text-muted ml-2 font-normal">
                ({Number(activeAccount.balance || 0).toFixed(4)} ETH)
              </span>
            </div>
          )}
          <button
            className="vote-btn-refresh"
            onClick={fetchProposals}
            disabled={proposalsLoading}
            title="Refresh proposals"
          >
            {proposalsLoading ? "..." : "Refresh"}
          </button>
        </div>

        <div className="vote-layout">
          <div className="vote-sidebar">
            <h3 className="vote-sidebar-title">
              Proposals ({proposals.length})
            </h3>
            {proposals.length === 0 && (
              <p className="vote-empty">No proposals found.</p>
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
                    {p.active ? "Active" : "Ended"}
                  </span>
                  <span className="vote-proposal-id">#{p.id}</span>
                </div>
                <h4 className="vote-proposal-title">{p.title}</h4>
                <div className="vote-proposal-meta">
                  <span>{p.totalVotes} votes</span>
                  <span>{p.candidates.length} candidates</span>
                </div>
                <div className="vote-proposal-time">
                  {getTimeRemaining(p.endDate)}
                </div>
                {p.hasVoted && <div className="vote-voted-tag">You voted</div>}
              </div>
            ))}
          </div>

          <div className="vote-main">
            {!selectedProposal ? (
              <div className="vote-placeholder">
                <div className="vote-placeholder-icon">Vote</div>
                <h3>Select a proposal to vote</h3>
                <p>
                  Click on any proposal from the left to see details and cast
                  your vote.
                </p>
              </div>
            ) : (
              <div className="vote-detail">
                <div className="vote-detail-header">
                  <div>
                    <span
                      className={`vote-status-badge big ${selectedProposal.active ? "active" : "ended"}`}
                    >
                      {selectedProposal.active ? "Active" : "Ended"}
                    </span>
                    <h2 className="vote-detail-title">
                      {selectedProposal.title}
                    </h2>
                    <p className="vote-detail-desc">
                      {selectedProposal.description}
                    </p>
                  </div>
                </div>

                <div className="vote-info-row">
                  <div className="vote-info-item">
                    <span className="vote-info-label">Start</span>
                    <span className="vote-info-value">
                      {formatDate(selectedProposal.startDate)}
                    </span>
                  </div>
                  <div className="vote-info-item">
                    <span className="vote-info-label">End</span>
                    <span className="vote-info-value">
                      {formatDate(selectedProposal.endDate)}
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
                      {getTimeRemaining(selectedProposal.endDate)}
                    </span>
                  </div>
                </div>

                {voteError && <div className="vote-error-box">{voteError}</div>}
                {voteSuccess && (
                  <div className="vote-success-box">{voteSuccess}</div>
                )}
                {selectedProposal.hasVoted && !voteSuccess && (
                  <div className="vote-info-box">
                    You have already voted on this proposal.
                  </div>
                )}

                <h3 className="vote-candidates-title">Candidates & Results</h3>
                <div className="vote-candidates-grid">
                  {selectedProposal.candidates.map((c) => {
                    const pct = getVotePercent(
                      c.votes,
                      selectedProposal.totalVotes,
                    );

                    return (
                      <div key={c.id} className="vote-candidate-card">
                        <div className="vote-candidate-top">
                          <div className="vote-candidate-avatar">
                            {c.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="vote-candidate-info">
                            <h4>{c.name}</h4>
                            <span className="vote-candidate-votes">
                              {c.votes} vote{c.votes !== 1 ? "s" : ""}
                            </span>
                          </div>
                          {selectedProposal.active && (
                            <button
                              className="vote-btn-vote"
                              disabled={voting}
                              onClick={() =>
                                handleVote(
                                  selectedProposal.id,
                                  c.id,
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
