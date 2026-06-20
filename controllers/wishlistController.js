import Wishlist from "../models/Wishlist.js";
import Product from "../models/Product.js";
import { generateWishlistNudge } from "../services/aiService.js";


export const getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ buyer: req.user.id }).populate(
      "items.product",
      "title price stock images isActive"
    );

    if (!wishlist) {
      wishlist = { buyer: req.user.id, items: [] };
    }

    res.status(200).json({ wishlist });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "productId is required" });
    }

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ message: "Product not found" });
    }

    let wishlist = await Wishlist.findOne({ buyer: req.user.id });
    if (!wishlist) {
      wishlist = await Wishlist.create({ buyer: req.user.id, items: [] });
    }

    const alreadySaved = wishlist.items.some((item) => item.product.toString() === productId);
    if (alreadySaved) {
      return res.status(400).json({ message: "Already in wishlist" });
    }

    wishlist.items.push({ product: productId });
    await wishlist.save();

    res.status(200).json({ message: "Added to wishlist", wishlist });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ buyer: req.user.id });
    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist not found" });
    }

    wishlist.items = wishlist.items.filter((item) => item.product.toString() !== productId);
    await wishlist.save();

    res.status(200).json({ message: "Removed from wishlist", wishlist });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getWishlistNudge = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ buyer: req.user.id }).populate(
      "items.product",
      "title price stock isActive"
    );

    if (!wishlist || wishlist.items.length === 0) {
      return res.status(200).json({ nudge: null });
    }

    const activeItems = wishlist.items
      .map((item) => item.product)
      .filter((product) => product && product.isActive);

    const nudge = await generateWishlistNudge(activeItems);
    res.status(200).json({ nudge });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};