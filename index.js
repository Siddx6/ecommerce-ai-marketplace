import express from "express";
import mongoose from "mongoose";
import "./utils/loadEnv.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import recommendationRoutes from "./routes/recommendationRoutes.js";
import assistantRoutes from "./routes/assistantRoutes.js";
import sellerToolsRoutes from "./routes/sellerToolsRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import insightsRoutes from "./routes/insightsRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import path from "path";
import { fileURLToPath } from "url";
import uploadRoutes from "./routes/uploadRoutes.js";

const app = express();
app.use(express.json({ limit: "5mb" }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// CORS middleware — MUST come before routes, or responses never get the header
app.use((req, res, next) => {
  const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:3000";
  res.header("Access-Control-Allow-Origin", allowedOrigin);
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/seller-tools", sellerToolsRoutes);
app.use("/api/assistant", assistantRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/products", productRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/insights", insightsRoutes);
app.use("/api/uploads", uploadRoutes);

// MongoDB connect
mongoose
  .connect("mongodb://localhost:27017/ecommerce_db")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

app.listen(5001, () => {
  console.log("Server running on port 5001");
});