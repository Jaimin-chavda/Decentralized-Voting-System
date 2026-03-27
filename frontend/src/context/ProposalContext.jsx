import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { apiRequest } from "../manage/apiClient";
import { useToast } from "../utils/toast";

const ProposalContext = createContext(null);

export function useProposals() {
  const ctx = useContext(ProposalContext);
  if (!ctx)
    throw new Error("useProposals must be used inside <ProposalProvider>");
  return ctx;
}

export function ProposalProvider({ children }) {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const fetchProposals = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiRequest("/api/proposals", { method: "GET" });
      
      // Standardize to match expected UI structure
      const formatted = data.map(p => ({
        id: p._id, // MongoDB ObjectId
        title: p.title,
        description: p.description,
        startDate: p.startDate ? new Date(p.startDate).toISOString().split('T')[0] : "",
        endDate: p.endDate ? new Date(p.endDate).toISOString().split('T')[0] : "",
        status: p.status === "ACTIVE" ? "active" : (p.status === "DRAFT" ? "draft" : "closed"),
        candidates: p.candidates || [],
        totalVotes: p.totalVotes || 0,
        active: p.status === "ACTIVE",
         // Store raw data for edits
         _raw: p
      }));
      setProposals(formatted);
    } catch (err) {
      console.error("Error fetching proposals from MongoDB:", err);
      // Fallback or handle error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProposals();
  }, [fetchProposals]);

  // Methods for Admin Dashboard to mutate Atlas DB
  const addProposal = async (proposalData) => {
    try {
      await apiRequest("/api/proposals", {
        method: "POST",
        body: JSON.stringify({
          title: proposalData.title,
          description: proposalData.description,
          startDate: proposalData.startDate,
          endDate: proposalData.endDate,
          candidates: proposalData.candidates || [],
          // Map local 'active'/'draft' to 'ACTIVE'/'DRAFT'
          status: proposalData.status === "active" ? "ACTIVE" : "DRAFT"
        })
      });
      addToast({ message: "Proposal saved to Database", type: "success" });
      fetchProposals();
    } catch (err) {
      addToast({ message: err.message, type: "error" });
    }
  };

  const updateProposal = async (id, updates) => {
    try {
      await apiRequest(`/api/proposals/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          ...updates,
          status: updates.status === "active" ? "ACTIVE" : (updates.status === "draft" ? "DRAFT" : "ENDED")
        })
      });
      addToast({ message: "Proposal updated in Database", type: "success" });
      fetchProposals();
    } catch (err) {
      addToast({ message: err.message, type: "error" });
    }
  };

  const deleteProposal = async (id) => {
    try {
      await apiRequest(`/api/proposals/${id}`, { method: "DELETE" });
      addToast({ message: "Proposal deleted", type: "success" });
      fetchProposals();
    } catch (err) {
      addToast({ message: err.message, type: "error" });
    }
  };

  const castVote = async (proposalId, candidateId) => {
    try {
      await apiRequest(`/api/proposals/${proposalId}/vote`, {
        method: "POST",
        body: JSON.stringify({ candidateId })
      });
      addToast({ message: "Vote cast successfully!", type: "success" });
      fetchProposals();
      return true;
    } catch (err) {
      addToast({ message: err.message, type: "error" });
      return false;
    }
  };

  const hasUserVoted = useCallback(() => {
    return false; // Handled dynamically in backend when fetching single proposal
  }, []);

  const activeProposals = proposals.filter((p) => p.active || p.status === "active");

  return (
    <ProposalContext.Provider
      value={{
        proposals,
        activeProposals,
        loading,
        fetchProposals,
        
        // Admin actions
        addProposal,
        updateProposal,
        deleteProposal,
        
        // User actions
        castVote,
        hasUserVoted
      }}
    >
      {children}
    </ProposalContext.Provider>
  );
}
