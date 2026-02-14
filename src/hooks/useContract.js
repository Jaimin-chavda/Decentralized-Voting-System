import { useState, useCallback, useEffect } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../contracts/contractConfig";

const HARDHAT_RPC = "http://127.0.0.1:8545";

/**
 * Hook to interact with the GovChainVoting contract on the local Hardhat node.
 * Uses ethers JsonRpcProvider directly — no MetaMask needed for demo testing.
 */
export function useContract() {
  const [provider, setProvider] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [activeAccount, setActiveAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Connect to the Hardhat local node
  const connect = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const rpcProvider = new ethers.JsonRpcProvider(HARDHAT_RPC);

      // Test connection
      await rpcProvider.getBlockNumber();

      // Get all Hardhat accounts
      const signers = [];
      for (let i = 0; i < 5; i++) {
        const signer = await rpcProvider.getSigner(i);
        const address = await signer.getAddress();
        const balance = await rpcProvider.getBalance(address);
        signers.push({
          index: i,
          address,
          balance: ethers.formatEther(balance),
          signer,
          label: i === 0 ? "Admin (Deployer)" : `Voter ${i}`,
        });
      }

      // Create contract instance
      const firstSigner = signers[0].signer;
      const contractInstance = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        firstSigner,
      );

      setProvider(rpcProvider);
      setAccounts(signers);
      setActiveAccount(signers[0]);
      setContract(contractInstance);
      setConnected(true);
    } catch (err) {
      setError(
        "Cannot connect to Hardhat node. Make sure it is running:\n" +
          "npx hardhat --config hardhat.config.cjs node",
      );
      setConnected(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // Switch active account
  const switchAccount = useCallback(
    (accountIndex) => {
      const account = accounts.find((a) => a.index === accountIndex);
      if (account && contract) {
        setActiveAccount(account);
        setContract(
          new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, account.signer),
        );
      }
    },
    [accounts, contract],
  );

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

        // Check if the active account has voted
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
      await tx.wait();
    },
    [contract],
  );

  // Auto-connect when the hook mounts
  useEffect(() => {
    connect();
  }, [connect]);

  return {
    connected,
    loading,
    error,
    accounts,
    activeAccount,
    connect,
    switchAccount,
    fetchProposals,
    castVote,
  };
}
