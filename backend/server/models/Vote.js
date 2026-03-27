import mongoose from "mongoose";

const voteSchema = new mongoose.Schema({
  proposal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Proposal",
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  candidateId: {
    type: Number,
    required: true
  },
  // If this is an on-chain vote, we track the transaction hash
  transactionHash: {
    type: String,
    sparse: true
  }
}, {
  timestamps: true
});

// Ensure a user can only vote once per proposal
voteSchema.index({ proposal: 1, user: 1 }, { unique: true });

export default mongoose.model("Vote", voteSchema);
