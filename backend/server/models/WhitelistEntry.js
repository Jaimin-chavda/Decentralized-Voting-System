import mongoose from "mongoose";

const whitelistEntrySchema = new mongoose.Schema({
  email: { type: String }, // Used to whitelist Web2 users
  walletAddress: { type: String }, // Used to whitelist Web3 users
  
  // The role they will receive upon registration
  role: { 
    type: String, 
    enum: ["SUPER_ADMIN", "UNIVERSITY_ADMIN", "INSTITUTE_ADMIN", "DEPARTMENT_ADMIN", "CLASS_ADMIN", "STUDENT"],
    default: "STUDENT"
  },
  
  // Dynamic reference indicating which entity they are whitelisted into
  scopeType: { 
    type: String, 
    enum: ["University", "Institute", "Department", "Class"], 
    required: true 
  },
  scopeId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true,
    refPath: "scopeType" // Mongoose will dynamically check the target collection
  },
  
  // Audit trail function
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

// Indexes to prevent duplicate whitelisting
whitelistEntrySchema.index(
  { email: 1, scopeId: 1 }, 
  { unique: true, partialFilterExpression: { email: { $type: "string" } } }
);
whitelistEntrySchema.index(
  { walletAddress: 1, scopeId: 1 }, 
  { unique: true, partialFilterExpression: { walletAddress: { $type: "string" } } }
);

export default mongoose.models.WhitelistEntry || mongoose.model("WhitelistEntry", whitelistEntrySchema);
