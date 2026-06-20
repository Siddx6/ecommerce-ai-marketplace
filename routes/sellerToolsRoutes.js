import express from "express";
import { generateCopy, autoTag, pricingBenchmark } from "../controllers/sellerToolsController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect, restrictTo("seller"));

router.post("/generate-copy", generateCopy);
router.post("/auto-tag", autoTag);
router.get("/pricing-benchmark", pricingBenchmark);

export default router;