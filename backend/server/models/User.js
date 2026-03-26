import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  walletAddress: { type: String, unique: true, sparse: true },
  
  // Access Control Roles hierarchy
  role: { 
    type: String, 
    enum: ["SUPER_ADMIN", "UNIVERSITY_ADMIN", "INSTITUTE_ADMIN", "DEPARTMENT_ADMIN", "CLASS_ADMIN", "STUDENT"],
    default: "STUDENT"
  },
  
  // Hierarchical scopes (determines WHERE their role applies)
  // E.g., An INSTITUTE_ADMIN will have their instituteId set, so they can only manage their own institute.
  universityId: { type: mongoose.Schema.Types.ObjectId, ref: "University" },
  instituteId:  { type: mongoose.Schema.Types.ObjectId, ref: "Institute" },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
  classId:      { type: mongoose.Schema.Types.ObjectId, ref: "Class" },
  
  // Whitelist/Registration verification flags
  isWhitelisted: { type: Boolean, default: false },
  status: { type: String, enum: ["PENDING", "ACTIVE", "BANNED"], default: "PENDING" }
}, { timestamps: true });

export default mongoose.models.User || mongoose.model("User", userSchema);
