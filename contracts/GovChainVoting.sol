// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

/**
 * @title GovChainVoting
 * @notice On-chain voting for governance proposals.
 *         Each proposal has a set of candidates; each wallet may vote once per proposal.
 */
contract GovChainVoting {

    // ── Types ────────────────────────────────────────────────────────

    struct Candidate {
        string name;
        uint256 voteCount;
    }

    struct Proposal {
        uint256 id;
        string title;
        string description;
        uint256 startTime;
        uint256 endTime;
        bool active;
        uint256 candidateCount;
    }

    // ── State ────────────────────────────────────────────────────────

    address public admin;
    uint256 public proposalCount;

    // proposalId → Proposal metadata
    mapping(uint256 => Proposal) private proposals;

    // proposalId → candidateIndex → Candidate
    mapping(uint256 => mapping(uint256 => Candidate)) private candidates;

    // proposalId → voterAddress → hasVoted
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    // ── Events ───────────────────────────────────────────────────────

    event ProposalCreated(
        uint256 indexed proposalId,
        string title,
        uint256 startTime,
        uint256 endTime
    );

    event Voted(
        uint256 indexed proposalId,
        uint256 indexed candidateIndex,
        address indexed voter
    );

    event ProposalEnded(uint256 indexed proposalId);

    // ── Modifiers ────────────────────────────────────────────────────

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    // ── Constructor ──────────────────────────────────────────────────

    constructor() {
        admin = msg.sender;
    }

    // ── Admin Functions ──────────────────────────────────────────────

    /**
     * @notice Create a new proposal with a fixed set of candidates.
     * @param _title          Proposal title
     * @param _description    Proposal description
     * @param _candidateNames Array of candidate names
     * @param _durationSecs   Voting window in seconds from now
     */
    function createProposal(
        string calldata _title,
        string calldata _description,
        string[] calldata _candidateNames,
        uint256 _durationSecs
    ) external onlyAdmin {
        require(_candidateNames.length > 0, "Need at least one candidate");
        require(_durationSecs > 0, "Duration must be positive");

        proposalCount++;
        uint256 pid = proposalCount;

        proposals[pid] = Proposal({
            id: pid,
            title: _title,
            description: _description,
            startTime: block.timestamp,
            endTime: block.timestamp + _durationSecs,
            active: true,
            candidateCount: _candidateNames.length
        });

        for (uint256 i = 0; i < _candidateNames.length; i++) {
            candidates[pid][i] = Candidate({
                name: _candidateNames[i],
                voteCount: 0
            });
        }

        emit ProposalCreated(pid, _title, block.timestamp, block.timestamp + _durationSecs);
    }

    /**
     * @notice End a proposal early (admin only).
     */
    function endProposal(uint256 _proposalId) external onlyAdmin {
        Proposal storage p = proposals[_proposalId];
        require(p.id != 0, "Proposal does not exist");
        require(p.active, "Proposal already ended");

        p.active = false;
        emit ProposalEnded(_proposalId);
    }

    // ── Voter Functions ──────────────────────────────────────────────

    /**
     * @notice Cast a vote for a candidate in an active proposal.
     * @param _proposalId     ID of the proposal
     * @param _candidateIndex Index of the candidate to vote for
     */
    function vote(uint256 _proposalId, uint256 _candidateIndex) external {
        Proposal storage p = proposals[_proposalId];
        require(p.id != 0, "Proposal does not exist");
        require(p.active, "Proposal is not active");
        require(block.timestamp <= p.endTime, "Voting period has ended");
        require(!hasVoted[_proposalId][msg.sender], "Already voted");
        require(_candidateIndex < p.candidateCount, "Invalid candidate index");

        hasVoted[_proposalId][msg.sender] = true;
        candidates[_proposalId][_candidateIndex].voteCount++;

        emit Voted(_proposalId, _candidateIndex, msg.sender);
    }

    // ── View Functions ───────────────────────────────────────────────

    /**
     * @notice Get proposal metadata.
     */
    function getProposal(uint256 _proposalId)
        external
        view
        returns (
            uint256 id,
            string memory title,
            string memory description,
            uint256 startTime,
            uint256 endTime,
            bool active,
            uint256 candidateCount
        )
    {
        Proposal storage p = proposals[_proposalId];
        require(p.id != 0, "Proposal does not exist");
        return (p.id, p.title, p.description, p.startTime, p.endTime, p.active, p.candidateCount);
    }

    /**
     * @notice Get a single candidate's data.
     */
    function getCandidate(uint256 _proposalId, uint256 _candidateIndex)
        external
        view
        returns (string memory name, uint256 voteCount)
    {
        require(proposals[_proposalId].id != 0, "Proposal does not exist");
        require(_candidateIndex < proposals[_proposalId].candidateCount, "Invalid candidate index");
        Candidate storage c = candidates[_proposalId][_candidateIndex];
        return (c.name, c.voteCount);
    }

    /**
     * @notice Get results: parallel arrays of candidate names and vote counts.
     */
    function getResults(uint256 _proposalId)
        external
        view
        returns (string[] memory names, uint256[] memory votes)
    {
        Proposal storage p = proposals[_proposalId];
        require(p.id != 0, "Proposal does not exist");

        names = new string[](p.candidateCount);
        votes = new uint256[](p.candidateCount);

        for (uint256 i = 0; i < p.candidateCount; i++) {
            names[i] = candidates[_proposalId][i].name;
            votes[i] = candidates[_proposalId][i].voteCount;
        }
    }
}
