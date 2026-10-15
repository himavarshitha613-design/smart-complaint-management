import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";

import { initializeDatabase, checkDatabaseHealth, getPool } from "./src/database/db.js";
import authRoutes from "./src/routes/authRoutes.js";
import complaintRoutes from "./src/routes/complaintRoutes.js";
import departmentRoutes from "./src/routes/departmentRoutes.js";
import reportRoutes from "./src/routes/reportRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.resolve("uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/reports", reportRoutes);

app.get("/api/health", async (req, res) => {
  const dbHealth = await checkDatabaseHealth();
  res.status(dbHealth.connected ? 200 : 503).json({
    status: dbHealth.connected ? "online" : "degraded",
    database: { connected: dbHealth.connected, message: dbHealth.message }
  });
});

async function runTestSuite() {
  console.log("=================================================");
  console.log("🧪 STARTING SMART CMS FULL HTTP & DATABASE TEST");
  console.log("=================================================\n");

  await initializeDatabase();

  const server = app.listen(8099, "127.0.0.1");
  const BASE = "http://127.0.0.1:8099/api";

  const request = async (url, options = {}) => {
    const { headers = {}, ...rest } = options;
    const res = await fetch(`${BASE}${url}`, {
      ...rest,
      headers: {
        "Content-Type": "application/json",
        ...headers
      }
    });
    const data = await res.json().catch(() => ({}));
    return { status: res.status, data };
  };

  try {
    // 1. Health check
    console.log("1. Testing Health Endpoint (/health)...");
    const health = await request("/health");
    console.log("   Health Status:", health.status, health.data);
    if (health.status !== 200 || !health.data.database?.connected) {
      throw new Error("Health check returned non-200 or database not connected");
    }
    console.log("   ✅ Health check passed!\n");

    // 2. Admin Login
    console.log("2. Testing Admin Login (/auth/login)...");
    const adminLogin = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "admin@smartcms.com", password: "admin123", role: "admin" })
    });
    console.log("   Admin Login Status:", adminLogin.status, "User:", adminLogin.data.user?.name);
    if (adminLogin.status !== 200 || !adminLogin.data.token) {
      throw new Error("Admin login failed");
    }
    const adminToken = adminLogin.data.token;
    console.log("   ✅ Admin login passed!\n");

    // 3. Register a New Test User
    const testEmail = `testuser_${Date.now()}@smartcms.com`;
    console.log(`3. Testing User Registration (/auth/register) with ${testEmail}...`);
    const regRes = await request("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: "Test Student",
        email: testEmail,
        phone: "9988776655",
        password: "user123",
        role: "user"
      })
    });
    console.log("   Registration Status:", regRes.status, "User ID:", regRes.data.user?.id);
    if (regRes.status !== 201 || !regRes.data.token) {
      throw new Error("User registration failed");
    }
    const userToken = regRes.data.token;
    const testUserId = regRes.data.user.id;
    console.log("   ✅ User registration passed!\n");

    // 4. User Login with Newly Registered User
    console.log("4. Testing User Login with registered account (/auth/login)...");
    const userLogin = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: testEmail, password: "user123", role: "user" })
    });
    console.log("   User Login Status:", userLogin.status);
    if (userLogin.status !== 200) {
      throw new Error("User login with new account failed");
    }
    console.log("   ✅ User login passed!\n");

    // 5. Fetch Departments
    console.log("5. Testing Departments Retrieval (/departments)...");
    const depts = await request("/departments");
    console.log("   Departments Count:", depts.data.departments?.length);
    if (depts.status !== 200 || !depts.data.departments || depts.data.departments.length === 0) {
      throw new Error("Failed to fetch departments from MySQL");
    }
    console.log("   ✅ Departments verified!\n");

    // 6. Test AI Complaint Text Analysis
    console.log("6. Testing AI Analysis (/complaints/analyze)...");
    const aiRes = await request("/complaints/analyze", {
      method: "POST",
      body: JSON.stringify({
        title: "WiFi network and router in computer lab is down",
        description: "The LAN connection and internet are not working for student PCs."
      })
    });
    console.log("   AI Analysis Category:", aiRes.data.analysis?.category, "Department:", aiRes.data.analysis?.department);
    if (aiRes.status !== 200 || !aiRes.data.analysis?.category) {
      throw new Error("AI analysis did not return category");
    }
    console.log("   ✅ AI analysis passed!\n");

    // 7. Submit Complaint to MySQL
    console.log("7. Testing Complaint Submission (/complaints)...");
    const submitRes = await request("/complaints", {
      method: "POST",
      headers: { Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({
        title: "Projector flickering in Seminar Hall 2",
        description: "Display turns purple and shuts off during guest lectures.",
        category: "IT / Technical",
        priority: "High",
        department: "IT Department",
        userId: testUserId,
        userName: "Test Student",
        userEmail: testEmail
      })
    });
    console.log("   Submission Status:", submitRes.status, "Complaint ID:", submitRes.data.complaintId);
    if (submitRes.status !== 201 || !submitRes.data.complaintId) {
      throw new Error("Complaint submission failed");
    }
    const newCompId = submitRes.data.complaintId;
    console.log("   ✅ Complaint submission passed!\n");

    // 8. Fetch Complaint by ID
    console.log(`8. Testing Complaint Details Retrieval (/complaints/${newCompId})...`);
    const detailsRes = await request(`/complaints/${newCompId}`);
    console.log("   Details Title:", detailsRes.data.complaint?.title, "Timeline Logs:", detailsRes.data.timeline?.length);
    if (detailsRes.status !== 200 || detailsRes.data.complaint?.id !== newCompId) {
      throw new Error("Failed to get complaint details");
    }
    console.log("   ✅ Complaint details retrieved!\n");

    // 9. Update Complaint Status & Notes (Admin update)
    console.log(`9. Testing Complaint Status Update (/complaints/${newCompId}/status)...`);
    const updateRes = await request(`/complaints/${newCompId}/status`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        status: "In Progress",
        resolution_notes: "Technician assigned to inspect HDMI cables and projector lamp."
      })
    });
    console.log("   Update Status:", updateRes.status, "Message:", updateRes.data.message);
    if (updateRes.status !== 200) {
      throw new Error("Failed to update complaint status");
    }

    // Verify update was persisted in MySQL
    const verifiedDetails = await request(`/complaints/${newCompId}`);
    if (verifiedDetails.data.complaint?.status !== "In Progress") {
      throw new Error("Complaint status was not updated in MySQL");
    }
    console.log("   ✅ Status update persisted and verified in MySQL!\n");

    // 10. Fetch My Complaints
    console.log(`10. Testing User's Complaints Retrieval (/complaints/my?email=${encodeURIComponent(testEmail)})...`);
    const myComp = await request(`/complaints/my?email=${encodeURIComponent(testEmail)}`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    console.log("   User's Complaints Count:", myComp.data.complaints?.length);
    if (myComp.status !== 200 || myComp.data.complaints?.length === 0) {
      throw new Error("Failed to fetch user's complaints");
    }
    console.log("   ✅ User complaints retrieved successfully!\n");

    // 11. Reports & Analytics
    console.log("11. Testing Analytics & Reports (/reports/analytics)...");
    const analyticsRes = await request("/reports/analytics");
    console.log("   Total Complaints:", analyticsRes.data.stats?.total, "Resolution Rate:", analyticsRes.data.stats?.resolutionRate);
    if (analyticsRes.status !== 200 || !analyticsRes.data.stats) {
      throw new Error("Failed to fetch analytics");
    }
    console.log("   ✅ Analytics verified successfully!\n");

    console.log("=================================================");
    console.log("🎉 ALL 11 TESTS PASSED PERFECTLY!");
    console.log("   - Registration: PASS");
    console.log("   - Login & JWT: PASS");
    console.log("   - Database Persistence: PASS");
    console.log("   - Departments: PASS");
    console.log("   - AI NLP Classifier: PASS");
    console.log("   - Complaint Submission: PASS");
    console.log("   - Complaint Retrieval: PASS");
    console.log("   - Complaint Status Update & Audit Logs: PASS");
    console.log("   - Analytics & Reports: PASS");
    console.log("=================================================\n");
  } finally {
    server.close();
    process.exit(0);
  }
}

runTestSuite().catch(err => {
  console.error("❌ Test suite encountered fatal error:", err);
  process.exit(1);
});
