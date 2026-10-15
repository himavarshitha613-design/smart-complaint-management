import { execSync } from "child_process";
import fs from "fs";
import path from "path";

console.log("🚀 Building Smart CMS frontend for production...");

try {
  // 1. Install frontend dependencies
  console.log("📦 Installing frontend dependencies...");
  execSync("npm install", {
    cwd: path.resolve("smart-complaint-frontend"),
    stdio: "inherit"
  });

  // 2. Run Vite build
  console.log("⚡ Compiling React + Vite production bundle...");
  execSync("npm run build", {
    cwd: path.resolve("smart-complaint-frontend"),
    stdio: "inherit"
  });

  // 3. Mirror dist to root ./dist so both root and subfolder output directories exist
  const srcDist = path.resolve("smart-complaint-frontend/dist");
  const targetDist = path.resolve("dist");

  if (fs.existsSync(targetDist)) {
    fs.rmSync(targetDist, { recursive: true, force: true });
  }
  fs.cpSync(srcDist, targetDist, { recursive: true });

  console.log("✅ Production bundle successfully compiled to ./dist and ./smart-complaint-frontend/dist!");
} catch (error) {
  console.error("❌ Build script failed:", error.message);
  process.exit(1);
}
