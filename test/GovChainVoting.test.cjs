const { expect } = require("chai");
const hre = require("hardhat");

describe("GovChainVoting", function () {
  let voting;
  let admin, voter1, voter2;

  // Deploy a fresh contract before each test
  beforeEach(async function () {
    [admin, voter1, voter2] = await hre.ethers.getSigners();

    const GovChainVoting = await hre.ethers.getContractFactory(
      "GovChainVoting",
    );
    voting = await GovChainVoting.deploy();
    await voting.waitForDeployment();
  });

  // Helper: create a standard test proposal
  async function createTestProposal(candidates, duration) {
    return voting.createProposal(
      "Test Proposal",
      "A test description",
      candidates || ["Yes", "No"],
      duration || 3600,
    );
  }

  // ── Deployment ─────────────────────────────────────────────────

  describe("Deployment", function () {
    it("should set the deployer as admin", async function () {
      expect(await voting.admin()).to.equal(admin.address);
    });

    it("should start with zero proposals", async function () {
      expect(await voting.proposalCount()).to.equal(0n);
    });
  });

  // ── Proposal Creation ──────────────────────────────────────────

  describe("Create Proposal", function () {
    it("should let admin create a proposal", async function () {
      await createTestProposal(["Alice", "Bob", "Charlie"]);

      expect(await voting.proposalCount()).to.equal(1n);

      const p = await voting.getProposal(1);
      expect(p.title).to.equal("Test Proposal");
      expect(p.active).to.equal(true);
      expect(p.candidateCount).to.equal(3n);
    });

    it("should reject creation by non-admin", async function () {
      try {
        await voting.connect(voter1).createProposal("Bad", "Nope", ["A"], 3600);
        expect.fail("Should have reverted");
      } catch (err) {
        expect(err.message).to.include("Only admin can perform this action");
      }
    });

    it("should reject creation with zero candidates", async function () {
      try {
        await voting.createProposal("Empty", "No candidates", [], 3600);
        expect.fail("Should have reverted");
      } catch (err) {
        expect(err.message).to.include("Need at least one candidate");
      }
    });
  });

  // ── Voting ─────────────────────────────────────────────────────

  describe("Voting", function () {
    beforeEach(async function () {
      await createTestProposal(["Alice", "Bob", "Charlie"]);
    });

    it("should allow a voter to cast a vote", async function () {
      const tx = await voting.connect(voter1).vote(1, 0);
      const receipt = await tx.wait();

      // Check the event was emitted
      const event = receipt.logs[0];
      expect(event).to.not.be.undefined;

      // Check vote count
      const [, voteCount] = await voting.getCandidate(1, 0);
      expect(voteCount).to.equal(1n);
    });

    it("should block double voting", async function () {
      await voting.connect(voter1).vote(1, 0);

      try {
        await voting.connect(voter1).vote(1, 1);
        expect.fail("Should have reverted");
      } catch (err) {
        expect(err.message).to.include("Already voted");
      }
    });

    it("should allow different voters to vote", async function () {
      await voting.connect(voter1).vote(1, 0);
      await voting.connect(voter2).vote(1, 1);

      const [, votes0] = await voting.getCandidate(1, 0);
      const [, votes1] = await voting.getCandidate(1, 1);
      expect(votes0).to.equal(1n);
      expect(votes1).to.equal(1n);
    });

    it("should reject vote for invalid candidate index", async function () {
      try {
        await voting.connect(voter1).vote(1, 99);
        expect.fail("Should have reverted");
      } catch (err) {
        expect(err.message).to.include("Invalid candidate index");
      }
    });

    it("should reject vote on non-existent proposal", async function () {
      try {
        await voting.connect(voter1).vote(999, 0);
        expect.fail("Should have reverted");
      } catch (err) {
        expect(err.message).to.include("Proposal does not exist");
      }
    });
  });

  // ── End Proposal ───────────────────────────────────────────────

  describe("End Proposal", function () {
    beforeEach(async function () {
      await createTestProposal(["X", "Y"]);
    });

    it("should let admin end a proposal", async function () {
      await voting.endProposal(1);

      const p = await voting.getProposal(1);
      expect(p.active).to.equal(false);
    });

    it("should reject ending by non-admin", async function () {
      try {
        await voting.connect(voter1).endProposal(1);
        expect.fail("Should have reverted");
      } catch (err) {
        expect(err.message).to.include("Only admin can perform this action");
      }
    });

    it("should block voting after proposal is ended", async function () {
      await voting.endProposal(1);

      try {
        await voting.connect(voter1).vote(1, 0);
        expect.fail("Should have reverted");
      } catch (err) {
        expect(err.message).to.include("Proposal is not active");
      }
    });
  });

  // ── Results ────────────────────────────────────────────────────

  describe("Get Results", function () {
    it("should return correct results after votes", async function () {
      await createTestProposal(["Alpha", "Beta"]);

      await voting.connect(voter1).vote(1, 0);
      await voting.connect(voter2).vote(1, 0);

      const [names, votes] = await voting.getResults(1);
      expect(names[0]).to.equal("Alpha");
      expect(names[1]).to.equal("Beta");
      expect(votes[0]).to.equal(2n);
      expect(votes[1]).to.equal(0n);
    });
  });
});
