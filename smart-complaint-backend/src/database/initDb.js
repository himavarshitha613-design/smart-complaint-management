import { initializeDatabase } from "./db.js";

console.log("🚀 Initializing Smart Complaint Management MySQL Database...");

initializeDatabase()
  .then(() => {
    console.log("✅ Database initialized successfully!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Initialization failed:", err.message);
    process.exit(1);
  });
