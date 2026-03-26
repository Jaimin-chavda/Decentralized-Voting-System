import mongoose from "mongoose";

const instituteSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  universityId: { type: mongoose.Schema.Types.ObjectId, ref: "University", required: true },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

// Ensure unique institute name within the same university
instituteSchema.index({ name: 1, universityId: 1 }, { unique: true });

export default mongoose.models.Institute || mongoose.model("Institute", instituteSchema);
