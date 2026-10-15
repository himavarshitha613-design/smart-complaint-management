import express from "express";
import { getAnalytics, getUserStats } from "../controllers/reportController.js";
import { optionalAuthenticateUser } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/analytics", getAnalytics);
router.get("/user-stats", optionalAuthenticateUser, getUserStats);

export default router;
