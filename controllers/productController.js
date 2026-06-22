import Product from "../models/Product.js";
import User from "../models/User.js";
import { parseSearchIntent } from "../services/aiService.js";
import { checkAndNotifyWishlist } from "../services/notificationService.js";
import PageView from "../models/PageView.js";

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

    const previousStock = product.stock;
    const previousPrice = product.price;

    const allowedFields = ["title", "description", "price", "stock", "category", "subCategory", "images", "isActive"];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    });

    await product.save();
    await checkAndNotifyWishlist(product, previousStock, previousPrice);

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

    // Record this view for traffic/conversion analytics — don't let a logging failure break the page
    PageView.create({ product: productId, viewer: req.user?.id || null }).catch((err) =>
      console.log("Failed to record page view:", err.message)
    );

    res.status(200).json({ product });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const searchProducts = async (req, res) => {
  try {
    const { q, category, subCategory, minPrice, maxPrice } = req.query;

    const filter = { isActive: true };

    if (q) {
      const regex = new RegExp(q, "i"); // case-insensitive partial match
      filter.$or = [{ title: regex }, { description: regex }, { category: regex }, { subCategory: regex }];
    }

    if (category) filter.category = category;
    if (subCategory) filter.subCategory = subCategory;

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const products = await Product.find(filter).populate("seller", "name sellerProfile.storeName");

    res.status(200).json({ count: products.length, products });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const autocompleteProducts = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(200).json({ suggestions: [] });
    }

    const regex = new RegExp("^" + q, "i"); // matches from the START of the word (prefix match)

    const matches = await Product.find({
      isActive: true,
      $or: [{ title: regex }, { category: regex }],
    })
      .select("title category")
      .limit(8);

    // Build a clean list of suggestion strings, no duplicates
    const suggestions = [...new Set(matches.map((p) => p.title))];

    res.status(200).json({ suggestions });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getAvailableFilters = async (req, res) => {
  try {
    const { q, category } = req.query;

    const baseFilter = { isActive: true };
    if (q) {
      const regex = new RegExp(q, "i");
      baseFilter.$or = [{ title: regex }, { description: regex }, { category: regex }, { subCategory: regex }];
    }
    if (category) baseFilter.category = category;

    const matchingProducts = await Product.find(baseFilter).select("category subCategory price");

    const categories = [...new Set(matchingProducts.map((p) => p.category))];
    const subCategories = [...new Set(matchingProducts.map((p) => p.subCategory).filter(Boolean))];

    const prices = matchingProducts.map((p) => p.price);
    const priceRange =
      prices.length > 0
        ? { min: Math.min(...prices), max: Math.max(...prices) }
        : { min: 0, max: 0 };

    res.status(200).json({ categories, subCategories, priceRange });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const smartSearchProducts = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ message: "q is required" });
    }

    const intent = await parseSearchIntent(q);

    const filter = { isActive: true };

    if (intent.keywords) {
      const words = intent.keywords.split(/\s+/).filter(Boolean);
      // Every word must appear SOMEWHERE (any field), in any order
      filter.$and = words.map((word) => ({
        $or: [
          { title: new RegExp(word, "i") },
          { description: new RegExp(word, "i") },
          { category: new RegExp(word, "i") },
          { subCategory: new RegExp(word, "i") },
        ],
      }));
    }

    if (intent.minPrice || intent.maxPrice) {
      filter.price = {};
      if (intent.minPrice) filter.price.$gte = intent.minPrice;
      if (intent.maxPrice) filter.price.$lte = intent.maxPrice;
    }

    const products = await Product.find(filter).populate("seller", "name sellerProfile.storeName");

    res.status(200).json({ interpretedAs: intent, count: products.length, products });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ count: products.length, products });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};