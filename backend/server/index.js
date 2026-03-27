import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import dns from "dns";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import proposalRoutes from "./routes/proposalRoutes.js";

// Load environment variables
dotenv.config();

// Override local network DNS (fixes querySrv ECONNREFUSED)
dns.setServers(["1.1.1.1", "8.8.8.8"]);

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser tools (Postman/curl) and same-origin server calls
    if (!origin) return callback(null, true);

    const isConfiguredOrigin = allowedOrigins.includes(origin);
    const isLocalhost = /^http:\/\/localhost(:\d+)?$/.test(origin);
    const isVercelPreview = /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin);

    if (isConfiguredOrigin || isLocalhost || isVercelPreview) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: false,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.use(express.json());

// Basic Route
app.get("/", (req, res) => {
  res.send("VoteChain API is running...");
});

app.get("/health", (req, res) => {
  res.status(200).json({ ok: true });
});

app.use("/api/auth", authRoutes);
app.use("/api/proposals", proposalRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
