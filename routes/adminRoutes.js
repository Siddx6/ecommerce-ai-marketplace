import express from "express";
import { getAllUsers, approveSeller } from "../controllers/adminController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect, restrictTo("admin"));

router.get("/users", getAllUsers);
router.patch("/users/:userId/approve-seller", approveSeller);

export default router;