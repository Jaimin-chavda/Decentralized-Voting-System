import mongoose from "mongoose";

const candidateSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  party: {
    type: String,
    trim: true,
    default: "Independent"
  },
  image: {
    type: String, // URL to candidate image
  },
  votes: {
    type: Number,
    default: 0 // Syncs with smart contract, or used for off-chain voting
  }
});

const proposalSchema = new mongoose.Schema({
  // If linked to the smart contract, this is the on-chain ID
  blockchainId: {
    type: Number,
    unique: true,
    sparse: true 
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  // Scope settings: Who is allowed to vote on this? (Useful for your University hierarchy)
  scopeType: {
    type: String,
    enum: ["UNIVERSITY", "INSTITUTE", "DEPARTMENT", "CLASS", "GLOBAL"],
    default: "GLOBAL"
  },
  scopeId: {
    type: mongoose.Schema.Types.ObjectId, // Connects to the specific University/Institute/etc ID
    refPath: "scopeModel"
  },
  scopeModel: {
    type: String,
    enum: ["University", "Institute", "Department", "Class"]
  },
  candidates: [candidateSchema],
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ["DRAFT", "ACTIVE", "ENDED"],
    default: "DRAFT"
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
}, {
  timestamps: true
});

// Virtual to check if the poll is currently active based on dates
proposalSchema.virtual("isActive").get(function() {
  const now = new Date();
  return this.status === "ACTIVE" && now >= this.startDate && now <= this.endDate;
});

export default mongoose.model("Proposal", proposalSchema);
