import express from "express";
import { getVolunteerStats, getVolunteerTasks } from "../controllers/volunteerController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = express.Router();

router.get("/stats", authMiddleware(['volunteer']),  getVolunteerStats);
router.get("/tasks", authMiddleware(['volunteer']),  getVolunteerTasks);

export default router;
