import Product from "../models/Product.js";
import User from "../models/User.js";

export const createProduct = async (req, res) => {
  try {
    const { title, description, price, stock, category, subCategory, images } = req.body;

    if (!title || !description || !price || !category) {
      return res.status(400).json({ message: "Title, description, price, and category are required" });
    }

    const seller = await User.findById(req.user.id);
    if (!seller || seller.role !== "seller") {
      return res.status(403).json({ message: "Only sellers can create listings" });
    }

    if (!seller.sellerProfile?.approved) {
      return res.status(403).json({ message: "Your seller account is not yet approved by an admin" });
    }

    const product = await Product.create({
      seller: seller._id,
      title,
      description,
      price,
      stock: stock || 0,
      category,
      subCategory: subCategory || "",
      images: images || [],
    });

    res.status(201).json({ message: "Product created", product });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only edit your own listings" });
    }

    const allowedFields = ["title", "description", "price", "stock", "category", "subCategory", "images", "isActive"];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    });

    await product.save();
    res.status(200).json({ message: "Product updated", product });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only delete your own listings" });
    }

    product.isActive = false;
    await product.save();

    res.status(200).json({ message: "Product removed from listing" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const { category, subCategory } = req.query;

    const filter = { isActive: true };
    if (category) filter.category = category;
    if (subCategory) filter.subCategory = subCategory;

    const products = await Product.find(filter).populate("seller", "name sellerProfile.storeName");

    res.status(200).json({ count: products.length, products });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId).populate("seller", "name sellerProfile.storeName");

    if (!product || !product.isActive) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ product });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};