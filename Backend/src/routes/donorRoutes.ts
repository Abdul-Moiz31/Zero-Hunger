import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { getDonorStats, createDonation, getMyDonations } from "../controllers/donorController";

const router = express.Router();

// Stats for donor dashboard
router.get("/stats", authMiddleware(["donor"]), getDonorStats);

// Create a donation
router.post("/donate", authMiddleware(["donor"]), createDonation);

// Get logged-in donor's donations
router.get("/my-donations", authMiddleware(["donor"]), getMyDonations);

export default router;  