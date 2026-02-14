const hre = require("hardhat");

async function main() {
  console.log("Deploying GovChainVoting...\n");

  const GovChainVoting = await hre.ethers.getContractFactory("GovChainVoting");
  const voting = await GovChainVoting.deploy();
  await voting.waitForDeployment();

  const address = await voting.getAddress();
  console.log("GovChainVoting deployed to:", address);

  // Seed sample proposals for quick testing

  console.log("\nSeeding sample proposals...\n");

  // Proposal 1 — 7-day voting window
  await voting.createProposal(
    "Community Treasury Allocation Q1",
    "Allocate 100,000 GOV tokens for community development.",
    ["Approve Full Allocation", "Approve 50% Only", "Reject Proposal"],
    7 * 24 * 60 * 60, // 7 days
  );
  console.log("  ✓ Proposal 1 created");

  // Proposal 2 — 14-day voting window
  await voting.createProposal(
    "Protocol Upgrade v2.5",
    "Upgrade governance contract with delegation and gasless voting.",
    ["Upgrade Immediately", "Delay to Q2"],
    14 * 24 * 60 * 60, // 14 days
  );
  console.log("  ✓ Proposal 2 created");

  // Proposal 3 — 5-day voting window
  await voting.createProposal(
    "New Council Member Election",
    "Elect a new member to the 7-seat governance council.",
    ["Aarav Mehta", "Priya Sharma", "Rahul Patel", "Sneha Joshi"],
    5 * 24 * 60 * 60, // 5 days
  );
  console.log("  ✓ Proposal 3 created");

  console.log("\n────────────────────────────────────────────────────────");
  console.log("Deployment complete!");
  console.log("Contract address:", address);
  console.log("Proposals seeded: 3");
  console.log("────────────────────────────────────────────────────────");
  console.log("\nCopy the contract address above into:");
  console.log("  src/contracts/contractConfig.js → CONTRACT_ADDRESS");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
