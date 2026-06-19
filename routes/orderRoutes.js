import express from "express";
import {
  checkout,
  getMyOrders,
  getSellerOrders,
  updateOrderItemStatus,
} from "../controllers/orderController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/checkout", checkout);
router.get("/my-orders", getMyOrders);
router.get("/seller-orders", restrictTo("seller"), getSellerOrders);
router.patch("/:orderId/items/:itemId", restrictTo("seller"), updateOrderItemStatus);

export default router;