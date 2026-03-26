import mongoose from "mongoose";

const universitySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  logoUrl: { type: String },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

export default mongoose.models.University || mongoose.model("University", universitySchema);
