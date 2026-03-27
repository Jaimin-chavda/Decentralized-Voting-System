import express from "express";
import { protect, adminProtect } from "../middleware/authMiddleware.js";
import {
  getProposals,
  getProposalById,
  createProposal,
  castVote,
  updateProposal,
  deleteProposal
} from "../controllers/proposalController.js";

const router = express.Router();

// Public/Protected read routes
router.get("/", getProposals); 
router.get("/:id", getProposalById);

// Admin-only creation/mgmt routes
router.post("/", protect, adminProtect, createProposal);
router.put("/:id", protect, adminProtect, updateProposal);
router.delete("/:id", protect, adminProtect, deleteProposal);

// User voting route
router.post("/:id/vote", protect, castVote);

export default router;
