import express from "express";
import { register, login, getProfile, getAllUsers } from "../controllers/authController.js";
import { authenticateUser } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", authenticateUser, getProfile);
router.get("/users", getAllUsers);

export default router;
