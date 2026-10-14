import express from "express";
import {
  getAllDepartments,
  createDepartment,
  deleteDepartment
} from "../controllers/departmentController.js";

const router = express.Router();

router.get("/", getAllDepartments);
router.post("/", createDepartment);
router.delete("/:id", deleteDepartment);

export default router;
