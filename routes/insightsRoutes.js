import express from "express";
import { getMySegment } from "../controllers/insightsController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/my-segment", protect, getMySegment);

export default router;