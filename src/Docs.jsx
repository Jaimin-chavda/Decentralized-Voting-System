import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const sections = [
  {
    id: "introduction",
    title: "Introduction",
    content: `GovChain is a decentralized governance (DAO) platform built on Ethereum that enables transparent, trustless decision-making through blockchain-based voting.\n\nOur platform allows communities to:\n- Create and manage governance proposals\n- Vote on-chain with full transparency\n- Track treasury allocations in real time\n- Delegate voting power to trusted representatives`,
  },
  {
    id: "smart-contract",
    title: "Smart Contract",
    content: `The GovChain smart contract is deployed on the Sepolia testnet and handles proposal creation, vote casting, and result tallying.\n\n**Contract Address:**\n\`0x5FbDB2315678afecb367f032d93F642f64180aa3\`\n\n**Key Functions:**\n- \`createProposal(string title, string description)\` — Creates a new proposal\n- \`vote(uint proposalId, uint candidateId)\` — Casts a vote for a candidate\n- \`getProposals()\` — Returns all proposals with their current state\n- \`getResults(uint proposalId)\` — Returns final vote counts`,
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract VotingSystem {
    struct Proposal {
        string title;
        string description;
        bool active;
        uint256 startTime;
        uint256 endTime;
    }

    mapping(uint => Proposal) public proposals;
    uint public proposalCount;

    function createProposal(
        string memory _title,
        string memory _desc
    ) public {
        proposalCount++;
        proposals[proposalCount] = Proposal(
            _title, _desc, true,
            block.timestamp,
            block.timestamp + 7 days
        );
    }
}`,
  },
  {
    id: "governance-flow",
    title: "Governance Flow",
    content: `The governance process follows four key stages:\n\n**1. Proposal Creation**\nAdmin or authorized users draft a proposal with title, description, candidates/options, and voting period.\n\n**2. Voting Period**\nToken holders review proposals and cast their votes. Each wallet address can vote once per proposal.\n\n**3. Vote Tallying**\nVotes are counted on-chain. Results are transparent and verifiable by anyone.\n\n**4. Execution**\nOnce the voting period ends, approved proposals can be executed automatically via smart contract.`,
  },
  {
    id: "api-integration",
    title: "API Integration",
    content: `GovChain uses ethers.js to interact with the deployed smart contract. The \`useContract\` hook abstracts the complexity of blockchain interactions.\n\n**Setup Requirements:**\n- MetaMask browser extension\n- Connected to Sepolia testnet\n- Test ETH for gas fees (available from faucets)`,
    code: `import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, ABI } from './contractConfig';

// Connect to provider
const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();

// Initialize contract
const contract = new ethers.Contract(
    CONTRACT_ADDRESS, ABI, signer
);

// Read proposals
const proposals = await contract.getProposals();

// Cast a vote
await contract.vote(proposalId, candidateId);`,
  },
  {
    id: "deployment",
    title: "Deployment",
    content: `**Local Development:**\n1. Clone the repository\n2. Install dependencies with \`npm install\`\n3. Start local Hardhat node: \`npx hardhat node\`\n4. Deploy contract: \`npx hardhat run scripts/deploy.js --network localhost\`\n5. Start dev server: \`npm run dev\`\n\n**Testnet Deployment:**\n1. Configure \`.env\` with your Sepolia RPC URL and private key\n2. Deploy: \`npx hardhat run scripts/deploy.js --network sepolia\`\n3. Update \`contractConfig.js\` with the new contract address\n4. Build: \`npm run build\``,
    code: `# Clone & setup
git clone https://github.com/Jaimin-chavda/Decentralized-Voting-System.git
cd dgs-app
npm install

# Start local blockchain
npx hardhat node

# Deploy contract (new terminal)
npx hardhat run scripts/deploy.js --network localhost

# Start frontend
npm run dev`,
  },
  {
    id: "faq",
    title: "FAQ",
    content: `**Q: Do I need cryptocurrency to vote?**\nA: You need a small amount of test ETH on Sepolia for gas fees. You can get free test ETH from Sepolia faucets.\n\n**Q: Can I change my vote after casting it?**\nA: No, votes are recorded on-chain and are immutable once cast.\n\n**Q: How are results verified?**\nA: All votes are stored on the Ethereum blockchain and can be independently verified by anyone.\n\n**Q: Is my vote anonymous?**\nA: Votes are pseudonymous — they are linked to your wallet address but not your real-world identity.\n\n**Q: What happens if a proposal passes?**\nA: The smart contract can automatically execute the approved action, depending on the proposal type.`,
  },
];

export default function Docs() {
  const [activeSection, setActiveSection] = useState("introduction");
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: "-20% 0px -70% 0px" },
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const copyCode = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen bg-bg-dark pt-8">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 lg:py-12">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="hidden lg:block w-56 shrink-0 sticky top-24 self-start">
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-4">
              Documentation
            </h3>
            <nav className="space-y-1">
              {sections.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className={`block px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                    activeSection === s.id
                      ? "text-primary bg-primary/10 font-medium"
                      : "text-text-muted hover:text-text-primary hover:bg-white/5"
                  }`}
                >
                  {s.title}
                </a>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <motion.main
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex-1 min-w-0"
          >
            {sections.map((s) => (
              <section key={s.id} id={s.id} className="mb-12 scroll-mt-24">
                <h2 className="text-2xl font-bold text-text-primary mb-4 pb-3 border-b border-border">
                  {s.title}
                </h2>
                <div className="text-sm text-text-muted leading-relaxed whitespace-pre-line mb-4">
                  {s.content.split("\n").map((line, i) => {
                    if (line.startsWith("**") && line.endsWith("**")) {
                      return (
                        <p
                          key={i}
                          className="font-semibold text-text-primary mt-4 mb-1"
                        >
                          {line.replace(/\*\*/g, "")}
                        </p>
                      );
                    }
                    if (line.startsWith("- ")) {
                      return (
                        <p key={i} className="ml-4">
                          • {line.slice(2)}
                        </p>
                      );
                    }
                    if (line.includes("`") && !line.startsWith("`")) {
                      const parts = line.split(/(`[^`]+`)/g);
                      return (
                        <p key={i}>
                          {parts.map((part, j) =>
                            part.startsWith("`") && part.endsWith("`") ? (
                              <code
                                key={j}
                                className="px-1.5 py-0.5 rounded bg-white/10 text-primary text-xs font-mono"
                              >
                                {part.slice(1, -1)}
                              </code>
                            ) : (
                              part
                            ),
                          )}
                        </p>
                      );
                    }
                    return line ? <p key={i}>{line}</p> : <br key={i} />;
                  })}
                </div>

                {s.code && (
                  <div className="relative rounded-xl bg-[#0d1117] border border-border overflow-hidden group">
                    <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-border">
                      <span className="text-xs text-text-muted font-mono">
                        code
                      </span>
                      <button
                        onClick={() => copyCode(s.code, s.id)}
                        className="text-xs text-text-muted hover:text-text-primary transition-colors"
                      >
                        {copied === s.id ? "✓ Copied!" : "📋 Copy"}
                      </button>
                    </div>
                    <pre className="p-4 overflow-x-auto text-sm text-text-muted font-mono leading-relaxed">
                      <code>{s.code}</code>
                    </pre>
                  </div>
                )}
              </section>
            ))}
          </motion.main>
        </div>
      </div>
    </div>
  );
}
