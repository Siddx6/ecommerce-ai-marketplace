import express from "express";
import {
  getBoughtTogether,
  getPersonalizedFeed,
  getCartRecommendations,
} from "../controllers/recommendationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/bought-together/:productId", getBoughtTogether);
router.get("/feed", protect, getPersonalizedFeed);
router.get("/cart", protect, getCartRecommendations);

export default router;