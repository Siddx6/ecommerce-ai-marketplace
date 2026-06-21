import express from "express";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  searchProducts,
  autocompleteProducts,
  getAvailableFilters,
  smartSearchProducts,
  getMyProducts,
} from "../controllers/productController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public browsing routes
router.get("/search", searchProducts);
router.get("/autocomplete", autocompleteProducts);
router.get("/filters", getAvailableFilters);
router.get("/smart-search", smartSearchProducts);
router.get("/my-products", protect, restrictTo("seller"), getMyProducts);
router.get("/", getAllProducts);
router.get("/:productId", getProductById);

// Seller-only routes
router.post("/", protect, restrictTo("seller"), createProduct);
router.patch("/:productId", protect, restrictTo("seller"), updateProduct);
router.delete("/:productId", protect, restrictTo("seller"), deleteProduct);

export default router;