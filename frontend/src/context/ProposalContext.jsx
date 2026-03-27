import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { ethers, JsonRpcProvider } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI, HARDHAT_NETWORK } from "../contracts/contractConfig";

const ProposalContext = createContext(null);

// Hook to access proposals from any component
export function useProposals() {
  const ctx = useContext(ProposalContext);
  if (!ctx)
    throw new Error("useProposals must be used inside <ProposalProvider>");
  return ctx;
}

export function ProposalProvider({ children }) {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProposals = useCallback(async () => {
    try {
      setLoading(true);
      // Use a read-only provider for fetching public data (works without MetaMask)
      const provider = new JsonRpcProvider(HARDHAT_NETWORK.rpcUrls[0]);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

      const count = await contract.proposalCount();
      const fetchedProposals = [];

      for (let i = 1; i <= Number(count); i++) {
        const p = await contract.getProposal(i);
        const candidates = [];
        for (let j = 0; j < Number(p.candidateCount); j++) {
          const c = await contract.getCandidate(i, j);
          // Standardizing structure to match existing React UI
          candidates.push({
            id: j,
            name: c.name,
            votes: Number(c.voteCount),
          });
        }

        fetchedProposals.push({
          id: Number(p.id),
          title: p.title,
          description: p.description,
          startTime: Number(p.startTime),
          endTime: Number(p.endTime),
          active: p.active,
          candidates,
          totalVotes: candidates.reduce((sum, c) => sum + c.votes, 0),
        });
      }
      setProposals(fetchedProposals);
    } catch (err) {
      console.error("Error fetching read-only proposals:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProposals();
  }, [fetchProposals]);

  // Legacy castVote fallback - LivePolls still calls this, but it shouldn't work 
  // without a wallet. Real voting happens in VotingPage.jsx using useContract.
  const castVote = useCallback(() => {
    console.warn("castVote called from ProposalContext. Please connect MetaMask in the Voting tab to vote.");
    return false; // Force UI to handle failure or redirect
  }, []);

  const hasUserVoted = useCallback(() => {
    return false; // True read state is fetched in VotingPage.jsx per user account
  }, []);

  // Get only active proposals
  const activeProposals = proposals.filter((p) => p.active);

  return (
    <ProposalContext.Provider
      value={{
        proposals,
        setProposals: fetchProposals, // Map set to fetch to allow manual refresh
        activeProposals,
        castVote,
        hasUserVoted,
        loading
      }}
    >
      {children}
    </ProposalContext.Provider>
  );
}
