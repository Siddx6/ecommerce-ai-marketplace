import express from "express";
import { getCart, addToCart, updateCartItem, removeFromCart } from "../controllers/cartController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/", getCart);
router.post("/", addToCart);
router.patch("/:productId", updateCartItem);
router.delete("/:productId", removeFromCart);

export default router;
