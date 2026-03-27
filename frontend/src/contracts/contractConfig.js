/**
 * Contract configuration for frontend.
 *
 * After deploying with: npx hardhat run scripts/deploy.cjs --network localhost
 * paste the printed contract address below.
 */

// Replace this with the deployed contract address from the deploy script
export const CONTRACT_ADDRESS = "0x8AC40393d870366b1c662F8369eA14883B4e1c2F";

// ABI — only the functions the frontend needs
// (full ABI is in artifacts/contracts/VoteChainVoting.sol/VoteChainVoting.json)
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

// Sepolia Testnet network
export const HARDHAT_CHAIN_ID = "0xaa36a7"; // 11155111 in hex
export const HARDHAT_NETWORK = {
  chainId: HARDHAT_CHAIN_ID,
  chainName: "Sepolia test network",
  rpcUrls: ["https://sepolia.infura.io/v3/"], 
  nativeCurrency: { name: "SepoliaETH", symbol: "SEP", decimals: 18 },
  blockExplorerUrls: ["https://sepolia.etherscan.io"],
};
