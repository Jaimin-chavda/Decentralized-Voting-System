import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./db.js";

// Import Controllers (to be created)
import { registerUser } from "./controllers/authController.js";

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Basic Route
app.get("/", (req, res) => {
  res.send("VoteChain API is running...");
});

// Authentication/Registration Route
// Endpoint to verify whitelist and register a user
app.post("/api/auth/register", registerUser);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
