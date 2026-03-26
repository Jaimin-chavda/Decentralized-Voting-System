import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  instituteId: { type: mongoose.Schema.Types.ObjectId, ref: "Institute", required: true },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

// Ensure unique department name within the same institute
departmentSchema.index({ name: 1, instituteId: 1 }, { unique: true });

export default mongoose.models.Department || mongoose.model("Department", departmentSchema);
