import express from "express"
import { authMiddleware } from "../middlewares/authMiddleware"
import * as donorController from "../controllers/donorController";
import multer from "multer"

const upload = multer({ storage: multer.memoryStorage() })

const router = express.Router()

router.post(
  "/donate",
  authMiddleware(["donor"]),
  upload.single("img"), // 👈 this parses multipart form and populates req.file
  donorController.createDonation
);
router.get("/stats", authMiddleware(["donor"]), donorController.getDonorStats);
router.get("/my-donations", authMiddleware(["donor"]), donorController.getMyDonations);
router.delete("/donate/:id", authMiddleware(["donor"]), donorController.deleteDonation);
router.put("/donation/:id/status", authMiddleware(["donor"]), donorController.updateDonationStatus);

export default router
