import express from "express";
import { getAnalytics, getUserStats } from "../controllers/reportController.js";

const router = express.Router();

router.get("/analytics", getAnalytics);
router.get("/user-stats", getUserStats);

export default router;
