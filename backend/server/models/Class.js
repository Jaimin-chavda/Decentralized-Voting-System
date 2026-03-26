import mongoose from "mongoose";

const classSchema = new mongoose.Schema({
  name: { type: String, required: true },
  batchYear: { type: Number, required: true },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Class Coordinator or CR
}, { timestamps: true });

// Ensure unique class combinations within the same department
classSchema.index({ name: 1, batchYear: 1, departmentId: 1 }, { unique: true });

export default mongoose.models.Class || mongoose.model("Class", classSchema);
