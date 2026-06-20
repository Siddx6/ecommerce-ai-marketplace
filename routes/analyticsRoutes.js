import express from "express";
import {
  getSellerAnalytics,
  getSellerAnalyticsSummary,
  getAdminAnalytics,
  getAdminAnalyticsSummary,
} from "../controllers/analyticsController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/seller", restrictTo("seller"), getSellerAnalytics);
router.get("/seller/summary", restrictTo("seller"), getSellerAnalyticsSummary);
router.get("/admin", restrictTo("admin"), getAdminAnalytics);
router.get("/admin/summary", restrictTo("admin"), getAdminAnalyticsSummary);

export default router;