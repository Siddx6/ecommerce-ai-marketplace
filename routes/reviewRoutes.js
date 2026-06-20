import express from "express";
import {
  createReview,
  getProductReviews,
  getSellerRating,
  getReviewSummary,
} from "../controllers/reviewController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/product/:productId", getProductReviews);
router.get("/product/:productId/summary", getReviewSummary);
router.get("/seller/:sellerId/rating", getSellerRating);

// Protected — must be logged in to leave a review
router.post("/", protect, createReview);

export default router;