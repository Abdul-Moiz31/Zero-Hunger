import express from "express";
import { getVolunteerStats } from "../controllers/volunteerController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = express.Router();

router.get("/stats", authMiddleware(['volunteer']),  getVolunteerStats);

export default router;
