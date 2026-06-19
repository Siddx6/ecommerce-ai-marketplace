import express from "express";
import { signup, login, getMe, becomeSeller } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", protect, getMe);
router.post("/become-seller", protect, becomeSeller);

export default router;