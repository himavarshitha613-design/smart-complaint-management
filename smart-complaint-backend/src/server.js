import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";

import { initializeDatabase, checkDatabaseHealth } from "./database/db.js";
import authRoutes from "./routes/authRoutes.js";
import complaintRoutes from "./routes/complaintRoutes.js";
import departmentRoutes from "./routes/departmentRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Configured allowed origins for CORS
const allowedOrigins = [
  "https://ai-ahtms6bxy-himavarshitha613-designs-projects.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "http://localhost:8080"
];

// Add custom CLIENT_URL from environment if provided
if (process.env.CLIENT_URL) {
  const envUrls = process.env.CLIENT_URL.split(",").map(u => u.trim());
  envUrls.forEach(url => {
    if (url && !allowedOrigins.includes(url)) {
      allowedOrigins.push(url);
    }
  });
}

const corsOptions = {
  origin: (origin, callback) => {
    // Allow server-to-server, mobile, curl, or undefined origins
    if (!origin) return callback(null, true);

    // Allow exact matches in allowedOrigins
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Allow any Vercel deployment URL (*.vercel.app)
    if (/^https:\/\/.*\.vercel\.app$/.test(origin)) {
      return callback(null, true);
    }

    // Allow onrender.com subdomains
    if (/^https:\/\/.*\.onrender\.com$/.test(origin)) {
      return callback(null, true);
    }

    // For flexibility in development or when testing
    return callback(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"]
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images statically
app.use("/uploads", express.static(path.resolve("uploads")));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/reports", reportRoutes);

// System Health Check (Checks Live Server & MySQL Database Status)
app.get("/api/health", async (req, res) => {
  const dbHealth = await checkDatabaseHealth();
  const statusCode = dbHealth.connected ? 200 : 503;

  res.status(statusCode).json({
    status: dbHealth.connected ? "online" : "degraded",
    system: "Smart Complaint Management System API",
    version: "2.0.0",
    database: {
      type: "MySQL",
      connected: dbHealth.connected,
      message: dbHealth.message,
      host: dbHealth.host || undefined,
      databaseName: dbHealth.database || undefined
    },
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
    console.warn("   If running on Render, set DB_HOST, DB_USER, DB_PASSWORD, DB_NAME (or DATABASE_URL) in Render Environment variables.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\n======================================================`);
    console.log(`🚀 Smart CMS Backend Server running at: http://localhost:${PORT}`);
    console.log(`📡 API Endpoints base URL:           http://localhost:${PORT}/api`);
    console.log(`🏥 Health Check:                     http://localhost:${PORT}/api/health`);
    console.log(`🌐 Allowed CORS:                     Vercel (*.vercel.app), localhost, Render`);
    console.log(`======================================================\n`);
  });
};

startServer();
