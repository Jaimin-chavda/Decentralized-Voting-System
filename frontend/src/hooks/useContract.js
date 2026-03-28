import { useState, useCallback, useEffect } from "react";
import { ethers, BrowserProvider } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../contracts/contractConfig";

/**
 * Hook to interact with the VoteChainVoting contract via MetaMask.
 */
export function useContract() {
  const [provider, setProvider] = useState(null);
  const [activeAccount, setActiveAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const connect = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const isMobile = /Android|iPhone|iPad|iPod|IEMobile|Opera Mini/i.test(
        navigator?.userAgent || ""
      );

      if (!window.ethereum) {
        throw new Error(
          isMobile
            ? "MetaMask was not detected in this browser. Open this site inside the MetaMask app browser to connect."
            : "MetaMask is not installed. Please install the MetaMask browser extension to use this app."
        );
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      if (accounts.length === 0) {
        throw new Error("No accounts found.");
      }

      // Force network switch
      const hexChainId = await window.ethereum.request({ method: "eth_chainId" });
      const HARDHAT_CHAIN_ID_HEX = "0xaa36a7"; // Sepolia
      if (hexChainId !== HARDHAT_CHAIN_ID_HEX) {
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: HARDHAT_CHAIN_ID_HEX }],
          });
        } catch (switchError) {
          throw new Error("Please manually switch network to Sepolia in MetaMask.");
        }
      }

      const web3Provider = new BrowserProvider(window.ethereum);
      const signer = await web3Provider.getSigner();
      const address = await signer.getAddress();
      const balance = await web3Provider.getBalance(address);

      const accountObj = {
        address,
        balance: ethers.formatEther(balance),
        signer,
      };

      const contractInstance = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );

      setProvider(web3Provider);
      setActiveAccount(accountObj);
      setContract(contractInstance);
      setConnected(true);

    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to connect to MetaMask.");
      setConnected(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // Listen for account/chain changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          setConnected(false);
          setActiveAccount(null);
          setContract(null);
        } else {
          connect();
        }
      };
      const handleChainChanged = () => window.location.reload();

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);

      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
          window.ethereum.removeListener("chainChanged", handleChainChanged);
        }
      };
    }
  }, [connect]);


  // Fetch all proposals
  const fetchProposals = useCallback(async () => {
    if (!contract) return [];
    try {
      const count = await contract.proposalCount();
      const proposals = [];

      for (let i = 1; i <= Number(count); i++) {
        const p = await contract.getProposal(i);
        const candidates = [];
        for (let j = 0; j < Number(p.candidateCount); j++) {
          const c = await contract.getCandidate(i, j);
          candidates.push({
            name: c.name,
            voteCount: Number(c.voteCount),
            index: j,
          });
        }

        let voted = false;
        if (activeAccount) {
          voted = await contract.hasVoted(i, activeAccount.address);
        }

        proposals.push({
          id: Number(p.id),
          title: p.title,
          description: p.description,
          startTime: Number(p.startTime),
          endTime: Number(p.endTime),
          active: p.active,
          candidates,
          hasVoted: voted,
          totalVotes: candidates.reduce((sum, c) => sum + c.voteCount, 0),
        });
      }
      return proposals;
    } catch (err) {
      console.error("Error fetching proposals:", err);
      return [];
    }
  }, [contract, activeAccount]);

  // Cast a vote
  const castVote = useCallback(
    async (proposalId, candidateIndex) => {
      if (!contract) throw new Error("Not connected");
      const tx = await contract.vote(proposalId, candidateIndex);
      await tx.wait(); // wait for block confirmation
    },
    [contract]
  );

  return {
    connected,
    loading,
    error,
    activeAccount,
    connect,
    fetchProposals,
    castVote,
  };
}
