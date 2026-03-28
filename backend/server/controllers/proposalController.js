import Proposal from "../models/Proposal.js";
import Vote from "../models/Vote.js";

// @desc    Get all proposals
// @route   GET /api/proposals
// @access  Public (or protected depending on scope)
export const getProposals = async (req, res) => {
  try {
    const statusFilter = req.query.status;
    let query = {};
    if (statusFilter) {
      query.status = statusFilter;
    }
    
    // In a real app with university scopes, you would filter by user's scope here
    const proposals = await Proposal.find(query).sort({ createdAt: -1 });
    
    // Calculate total votes dynamically
    const formattedProposals = proposals.map(p => {
      const obj = p.toObject();
      obj.totalVotes = obj.candidates.reduce((sum, c) => sum + c.votes, 0);
      return obj;
    });

    res.json(formattedProposals);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch proposals", error: err.message });
  }
};

// @desc    Get a single proposal by ID
// @route   GET /api/proposals/:id
// @access  Public
export const getProposalById = async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) return res.status(404).json({ message: "Proposal not found" });

    const obj = proposal.toObject();
    obj.totalVotes = obj.candidates.reduce((sum, c) => sum + c.votes, 0);
    
    // If user is logged in, check if they already voted
    let hasVoted = false;
    if (req.user) {
      const existingVote = await Vote.findOne({ proposal: proposal._id, user: req.user._id });
      if (existingVote) hasVoted = true;
    }
    obj.hasVoted = hasVoted;

    res.json(obj);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @desc    Create a new proposal
// @route   POST /api/proposals
// @access  Private/Admin
export const createProposal = async (req, res) => {
  try {
    const {
      title,
      description,
      candidates,
      startDate,
      endDate,
      scopeType,
      status,
    } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ message: "Proposal title is required" });
    }

    if (!description?.trim()) {
      return res.status(400).json({ message: "Proposal description is required" });
    }

    if (!startDate || !endDate) {
      return res.status(400).json({ message: "Start date and end date are required" });
    }

    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);

    if (Number.isNaN(parsedStartDate.getTime()) || Number.isNaN(parsedEndDate.getTime())) {
      return res.status(400).json({ message: "Invalid proposal dates" });
    }

    if (parsedEndDate <= parsedStartDate) {
      return res.status(400).json({ message: "End date must be after start date" });
    }

    const candidateNames = Array.isArray(candidates) ? candidates : [];

    // Standardize candidates array
    const formattedCandidates = candidateNames
      .filter((name) => typeof name === "string" && name.trim())
      .map((name, index) => ({
      id: index,
      name: name.trim(),
      votes: 0
    }));

    const proposal = new Proposal({
      title: title.trim(),
      description: description.trim(),
      candidates: formattedCandidates,
      startDate: parsedStartDate,
      endDate: parsedEndDate,
      scopeType: scopeType || "GLOBAL",
      status: status || "DRAFT",
      createdBy: req.user._id
    });

    const savedProposal = await proposal.save();
    res.status(201).json(savedProposal);
  } catch (err) {
    res.status(400).json({ message: err.message || "Failed to create proposal" });
  }
};

// @desc    Cast a vote on a proposal (Off-chain DB voting)
// @route   POST /api/proposals/:id/vote
// @access  Private
export const castVote = async (req, res) => {
  try {
    const { candidateId } = req.body;
    const proposalId = req.params.id;
    const userId = req.user._id;

    const proposal = await Proposal.findById(proposalId);
    if (!proposal) return res.status(404).json({ message: "Proposal not found" });

    // Check if proposal is active
    if (!proposal.isActive) {
      return res.status(400).json({ message: "Voting is closed for this proposal" });
    }

    // Check if user already voted
    const existingVote = await Vote.findOne({ proposal: proposalId, user: userId });
    if (existingVote) {
      return res.status(400).json({ message: "You have already voted on this proposal" });
    }

    // Validate candidate
    const candidateIndex = proposal.candidates.findIndex(c => c.id === Number(candidateId));
    if (candidateIndex === -1) {
      return res.status(400).json({ message: "Invalid candidate ID" });
    }

    // Record the vote
    const vote = new Vote({
      proposal: proposalId,
      user: userId,
      candidateId: Number(candidateId)
    });
    await vote.save();

    // Increment candidate vote count
    proposal.candidates[candidateIndex].votes += 1;
    await proposal.save();

    res.json({ message: "Vote cast successfully", candidate: proposal.candidates[candidateIndex].name });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "You have already voted on this proposal" });
    }
    res.status(500).json({ message: "Failed to cast vote", error: err.message });
  }
};

// @desc    Update a proposal (Edit details, add candidates, change status)
// @route   PUT /api/proposals/:id
// @access  Private/Admin
export const updateProposal = async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) return res.status(404).json({ message: "Proposal not found" });

    // Ensure candidates have proper IDs if they are new
    if (req.body.candidates) {
      req.body.candidates = req.body.candidates.map((c, idx) => ({
        ...c,
        id: c.id !== undefined ? c.id : idx,
        votes: c.votes || 0
      }));
    }

    const updatedProposal = await Proposal.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.json(updatedProposal);
  } catch (err) {
    res.status(400).json({ message: "Failed to update proposal", error: err.message });
  }
};

// @desc    Delete a proposal
// @route   DELETE /api/proposals/:id
// @access  Private/Admin
export const deleteProposal = async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) return res.status(404).json({ message: "Proposal not found" });

    await Proposal.deleteOne({ _id: req.params.id });
    // Also delete associated votes
    await Vote.deleteMany({ proposal: req.params.id });

    res.json({ message: "Proposal and associated votes deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete proposal", error: err.message });
  }
};
