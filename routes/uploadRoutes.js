import express from "express";
import { uploadImage } from "../controllers/uploadController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/", protect, restrictTo("seller"), upload.single("image"), uploadImage);

export default router;