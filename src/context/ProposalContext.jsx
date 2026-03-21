import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { SEED_PROPOSALS } from "../data/demoData";

const ProposalContext = createContext(null);

const LS_PROPOSALS_KEY = "votechain_proposals";
const LS_VOTES_KEY = "votechain_user_votes"; // track which user voted on which proposal

// Hook to access proposals from any component
export function useProposals() {
  const ctx = useContext(ProposalContext);
  if (!ctx)
    throw new Error("useProposals must be used inside <ProposalProvider>");
  return ctx;
}

export function ProposalProvider({ children }) {
  // Initialize from localStorage or fall back to seed data
  const [proposals, setProposals] = useState(() => {
    try {
      const stored = localStorage.getItem(LS_PROPOSALS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      /* ignore corrupt data */
    }
    return SEED_PROPOSALS;
  });

  // Track votes per user: { "user@email.com": ["proposalId1", "proposalId2"] }
  const [userVotes, setUserVotes] = useState(() => {
    try {
      const stored = localStorage.getItem(LS_VOTES_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      /* ignore */
    }
    return {};
  });

  // Persist proposals to localStorage
  useEffect(() => {
    localStorage.setItem(LS_PROPOSALS_KEY, JSON.stringify(proposals));
  }, [proposals]);

  // Persist votes to localStorage
  useEffect(() => {
    localStorage.setItem(LS_VOTES_KEY, JSON.stringify(userVotes));
  }, [userVotes]);

  // Check if a user has voted on a proposal
  const hasUserVoted = useCallback(
    (userEmail, proposalId) => {
      if (!userEmail) return false;
      return (userVotes[userEmail] || []).includes(proposalId);
    },
    [userVotes],
  );

  // Cast a vote — increment candidate vote count and mark user as voted
  const castVote = useCallback(
    (userEmail, proposalId, candidateId) => {
      if (!userEmail) return false;

      // Check if already voted
      if ((userVotes[userEmail] || []).includes(proposalId)) return false;

      // Update proposals
      setProposals((prev) =>
        prev.map((p) => {
          if (p.id !== proposalId) return p;
          return {
            ...p,
            candidates: (p.candidates || []).map((c) =>
              c.id === candidateId ? { ...c, votes: c.votes + 1 } : c,
            ),
          };
        }),
      );

      // Mark user as voted
      setUserVotes((prev) => ({
        ...prev,
        [userEmail]: [...(prev[userEmail] || []), proposalId],
      }));

      return true;
    },
    [userVotes],
  );

  // Get only active proposals (for homepage)
  const activeProposals = proposals.filter((p) => p.status === "active");

  return (
    <ProposalContext.Provider
      value={{
        proposals,
        setProposals,
        activeProposals,
        castVote,
        hasUserVoted,
      }}
    >
      {children}
    </ProposalContext.Provider>
  );
}
