import Review from "../models/Review.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { summarizeReviews } from "../services/aiService.js";

export const createReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;

    if (!productId || !rating) {
      return res.status(400).json({ message: "productId and rating are required" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "rating must be between 1 and 5" });
    }

    // Verified purchase check: did this buyer actually order this product?
    const hasPurchased = await Order.exists({
      buyer: req.user.id,
      "items.product": productId,
    });

    if (!hasPurchased) {
      return res.status(403).json({ message: "You can only review products you've purchased" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Basic spam check: flag if this EXACT comment text already exists elsewhere (likely bot/copy-paste spam)
    let isFlagged = false;
    if (comment && comment.trim().length > 0) {
      const duplicateExists = await Review.exists({
        comment: { $regex: `^${comment.trim()}$`, $options: "i" },
      });
      if (duplicateExists) {
        isFlagged = true;
      }
    }

    const review = await Review.create({
      product: productId,
      seller: product.seller,
      buyer: req.user.id,
      rating,
      comment: comment || "",
      isFlagged,
    });

    res.status(201).json({ message: "Review submitted", review });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "You've already reviewed this product" });
    }
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    const reviews = await Review.find({ product: productId, isFlagged: false })
      .populate("buyer", "name")
      .sort({ createdAt: -1 });

    const averageRating =
      reviews.length > 0
        ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
        : null;

    res.status(200).json({ count: reviews.length, averageRating, reviews });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getSellerRating = async (req, res) => {
  try {
    const { sellerId } = req.params;

    const reviews = await Review.find({ seller: sellerId, isFlagged: false });

    const averageRating =
      reviews.length > 0
        ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
        : null;

    res.status(200).json({ totalReviews: reviews.length, averageRating });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getReviewSummary = async (req, res) => {
  try {
    const { productId } = req.params;

    const reviews = await Review.find({ product: productId, isFlagged: false }).select("rating comment");

    if (reviews.length === 0) {
      return res.status(200).json({ message: "No reviews yet", pros: [], cons: [] });
    }

    const summary = await summarizeReviews(reviews);
    res.status(200).json({ basedOnReviews: reviews.length, ...summary });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};