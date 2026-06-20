import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getWishlist, addToWishlist, removeFromWishlist, getWishlistNudge } from "../controllers/wishlistController.js";

const router = express.Router();

router.use(protect);

router.get("/", getWishlist);
router.post("/", addToWishlist);
router.delete("/:productId", removeFromWishlist);
router.get("/nudge", getWishlistNudge);

export default router;