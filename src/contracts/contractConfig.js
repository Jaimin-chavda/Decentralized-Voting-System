/**
 * Contract configuration for frontend.
 *
 * After deploying with: npx hardhat run scripts/deploy.cjs --network localhost
 * paste the printed contract address below.
 */

// Replace this with the deployed contract address from the deploy script
export const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// ABI — only the functions the frontend needs
// (full ABI is in artifacts/contracts/GovChainVoting.sol/GovChainVoting.json)
export const CONTRACT_ABI = [
  // Admin functions
  "function createProposal(string calldata _title, string calldata _description, string[] calldata _candidateNames, uint256 _durationSecs) external",
  "function endProposal(uint256 _proposalId) external",

  // Voter functions
  "function vote(uint256 _proposalId, uint256 _candidateIndex) external",

  // View functions
  "function admin() view returns (address)",
  "function proposalCount() view returns (uint256)",
  "function hasVoted(uint256, address) view returns (bool)",
  "function getProposal(uint256 _proposalId) view returns (uint256 id, string title, string description, uint256 startTime, uint256 endTime, bool active, uint256 candidateCount)",
  "function getCandidate(uint256 _proposalId, uint256 _candidateIndex) view returns (string name, uint256 voteCount)",
  "function getResults(uint256 _proposalId) view returns (string[] names, uint256[] votes)",

  // Events
  "event ProposalCreated(uint256 indexed proposalId, string title, uint256 startTime, uint256 endTime)",
  "event Voted(uint256 indexed proposalId, uint256 indexed candidateIndex, address indexed voter)",
  "event ProposalEnded(uint256 indexed proposalId)",
];

// Hardhat localhost network
export const HARDHAT_CHAIN_ID = "0x7a69"; // 31337 in hex
export const HARDHAT_NETWORK = {
  chainId: HARDHAT_CHAIN_ID,
  chainName: "Hardhat Localhost",
  rpcUrls: ["http://127.0.0.1:8545"],
  nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
};
