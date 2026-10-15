import express from "express";
import {
  createComplaint,
  getAllComplaints,
  getMyComplaints,
  getComplaintById,
  updateComplaintStatus,
  deleteComplaint,
  analyzeComplaint
} from "../controllers/complaintController.js";
import { upload } from "../middleware/uploadMiddleware.js";
import { optionalAuthenticateUser } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/analyze", analyzeComplaint);
router.post("/", optionalAuthenticateUser, upload.single("image"), createComplaint);
router.get("/", getAllComplaints);
router.get("/my", optionalAuthenticateUser, getMyComplaints);
router.get("/:id", getComplaintById);
router.put("/:id/status", updateComplaintStatus);
router.delete("/:id", deleteComplaint);

export default router;
