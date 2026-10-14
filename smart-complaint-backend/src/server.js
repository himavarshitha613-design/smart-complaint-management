import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";

import { initializeDatabase } from "./database/db.js";
import authRoutes from "./routes/authRoutes.js";
import complaintRoutes from "./routes/complaintRoutes.js";
import departmentRoutes from "./routes/departmentRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors({
  origin: "*", // allow all origins during development
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images statically
app.use("/uploads", express.static(path.resolve("uploads")));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/reports", reportRoutes);

// System Health Check
app.get("/api/health", (req, res) => {
  res.json({
    status: "online",
    system: "Smart Complaint Management System API",
    version: "2.0.0",
    database: "MySQL",
    timestamp: new Date().toISOString()
  });
});

// Root Route
app.get("/", (req, res) => {
  res.send("🤖 Smart Complaint Management System API is running on port " + PORT);
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.originalUrl}' not found.`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
});

// Start Server & Connect to MySQL
const startServer = async () => {
  try {
    await initializeDatabase();
    console.log("🚀 MySQL Database connected and schemas verified.");
  } catch (err) {
    console.warn("⚠️  Server started, but MySQL connection needs attention:");
    console.warn(`   ${err.message}`);
    console.warn("   Check DB_PASSWORD in smart-complaint-backend/.env");
  }

  app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 Smart CMS Backend Server running at: http://localhost:${PORT}`);
    console.log(`📡 API Endpoints base URL:           http://localhost:${PORT}/api`);
    console.log(`🏥 Health Check:                     http://localhost:${PORT}/api/health`);
    console.log(`======================================================\n`);
  });
};

startServer();
