import Product from "../models/Product.js";
import { generateProductCopy, suggestCategory, generateProductCopyFromImageFile } from "../services/aiService.js";

export const generateCopy = async (req, res) => {
  try {
    const { roughTitle, category, keyFeatures } = req.body;

    if (!roughTitle || !category) {
      return res.status(400).json({ message: "roughTitle and category are required" });
    }

    const copy = await generateProductCopy({ roughTitle, category, keyFeatures });
    res.status(200).json({ generated: copy });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const autoTag = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "title and description are required" });
    }

    const existingProducts = await Product.find({ isActive: true }).select("category subCategory");
    const existingCategories = [
      ...new Set(
        existingProducts.map((p) => JSON.stringify({ category: p.category, subCategory: p.subCategory }))
      ),
    ].map((s) => JSON.parse(s));

    const suggestion = await suggestCategory({ title, description, existingCategories });
    res.status(200).json({ suggestion });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const pricingBenchmark = async (req, res) => {
  try {
    const { category, subCategory } = req.query;

    if (!category) {
      return res.status(400).json({ message: "category is required" });
    }

    // Try matching both category + subCategory first (more precise)
    let filter = { isActive: true, category };
    if (subCategory) filter.subCategory = subCategory;

    let comparableProducts = await Product.find(filter).select("price");

    // If too few matches with subCategory, fall back to category-only
    if (subCategory && comparableProducts.length < 2) {
      comparableProducts = await Product.find({ isActive: true, category }).select("price");
    }

    if (comparableProducts.length === 0) {
      return res.status(200).json({
        message: "No comparable products found yet in this category",
        sampleSize: 0,
        benchmark: null,
      });
    }

    const prices = comparableProducts.map((p) => p.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const avg = Math.round(prices.reduce((sum, p) => sum + p, 0) / prices.length);

    res.status(200).json({
      sampleSize: prices.length,
      benchmark: { min, max, avg },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const generateCopyFromImage = async (req, res) => {
  try {
    const { imageUrl, category } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ message: "imageUrl is required" });
    }

    // Extract just the filename from the full URL (e.g., ".../uploads/12345.jpg" -> "12345.jpg")
    const filename = imageUrl.split("/uploads/")[1];
    if (!filename) {
      return res.status(400).json({ message: "Invalid image URL — must be an uploaded image" });
    }

    const copy = await generateProductCopyFromImageFile(filename, category);
    res.status(200).json({ generated: copy });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};