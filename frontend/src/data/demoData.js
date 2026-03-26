// ─── Demo Admin Credentials ──────────────────────────────────────────
export const DEMO_ADMIN = {
  email: 'admin@votechain.io',
  password: 'admin123',
  name: 'Admin',
};

// Demo regular user credentials
export const DEMO_USER = {
  email: 'user@votechain.io',
  password: 'user123',
  name: 'Jaimin',
};

// ─── Helper ──────────────────────────────────────────────────────────
let _idCounter = 100;
export function generateId() {
  return `id_${Date.now()}_${_idCounter++}`;
}

// ─── Seed Proposals + Candidates ─────────────────────────────────────
export const SEED_PROPOSALS = [
  {
    id: 'p1',
    title: 'Community Treasury Allocation Q1',
    description:
      'Allocate 100,000 GOV tokens from the treasury to fund community development initiatives including hackathons, educational content, and open-source tooling.',
    status: 'active',
    startDate: '2026-02-01',
    endDate: '2026-02-28',
    candidates: [
      { id: 'c1', name: 'Approve Full Allocation', party: 'Pro-Growth', votes: 482, avatar: '✅' },
      { id: 'c2', name: 'Approve 50% Only', party: 'Conservative', votes: 238, avatar: '⚖️' },
      { id: 'c3', name: 'Reject Proposal', party: 'Opposition', votes: 122, avatar: '❌' },
    ],
  },
  {
    id: 'p2',
    title: 'Protocol Upgrade v2.5',
    description:
      'Upgrade the governance smart contract to v2.5 with delegation support, gasless voting, and improved quorum calculations.',
    status: 'active',
    startDate: '2026-02-10',
    endDate: '2026-03-10',
    candidates: [
      { id: 'c4', name: 'Upgrade Immediately', party: 'Progressive', votes: 315, avatar: '🚀' },
      { id: 'c5', name: 'Delay to Q2', party: 'Cautious', votes: 189, avatar: '⏳' },
    ],
  },
  {
    id: 'p3',
    title: 'New Council Member Election',
    description:
      'Elect a new member to the 7-seat governance council to replace the outgoing representative from Sector B.',
    status: 'active',
    startDate: '2026-02-05',
    endDate: '2026-02-20',
    candidates: [
      { id: 'c6', name: 'Aarav Mehta', party: 'Decentralists', votes: 267, avatar: '👤' },
      { id: 'c7', name: 'Priya Sharma', party: 'Community First', votes: 341, avatar: '👩' },
      { id: 'c8', name: 'Rahul Patel', party: 'Independent', votes: 156, avatar: '🧑' },
      { id: 'c9', name: 'Sneha Joshi', party: 'Tech Alliance', votes: 203, avatar: '👩‍💻' },
    ],
  },
  {
    id: 'p4',
    title: 'Marketing Budget Approval',
    description:
      'Approve a 50,000 GOV budget for Q2 marketing activities including social media campaigns, conference sponsorships, and influencer partnerships.',
    status: 'draft',
    startDate: '2026-03-01',
    endDate: '2026-03-15',
    candidates: [
      { id: 'c10', name: 'Approve Budget', party: 'Pro-Marketing', votes: 0, avatar: '✅' },
      { id: 'c11', name: 'Reduce to 30K', party: 'Moderate', votes: 0, avatar: '📉' },
      { id: 'c12', name: 'Reject Budget', party: 'Opposition', votes: 0, avatar: '❌' },
    ],
  },
  {
    id: 'p5',
    title: 'Staking Rewards Adjustment',
    description:
      'Adjust the annual staking reward rate from 12% to 8% to ensure long-term protocol sustainability.',
    status: 'closed',
    startDate: '2026-01-01',
    endDate: '2026-01-31',
    candidates: [
      { id: 'c13', name: 'Reduce to 8%', party: 'Sustainability', votes: 521, avatar: '📊' },
      { id: 'c14', name: 'Keep at 12%', party: 'Stakers Union', votes: 379, avatar: '💰' },
    ],
  },
];
