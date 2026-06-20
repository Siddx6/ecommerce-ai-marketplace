import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Cart from "../models/Cart.js";

export const getBoughtTogether = async (req, res) => {
  try {
    const { productId } = req.params;
    const limit = parseInt(req.query.limit) || 5;

    // Find all orders that included this product
    const orders = await Order.find({ "items.product": productId });

    // Tally how often each OTHER product appears alongside it
    const tally = {};
    for (const order of orders) {
      for (const item of order.items) {
        const itemProductId = item.product.toString();
        if (itemProductId === productId) continue;
        tally[itemProductId] = (tally[itemProductId] || 0) + 1;
      }
    }

    // Sort by frequency, take the top N
    const sortedIds = Object.entries(tally)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([id]) => id);

    const products = await Product.find({
      _id: { $in: sortedIds },
      isActive: true,
    });

    res.status(200).json({ count: products.length, products });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getPersonalizedFeed = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const pastOrders = await Order.find({ buyer: req.user.id });
    const purchasedProductIds = [];
    for (const order of pastOrders) {
      for (const item of order.items) {
        purchasedProductIds.push(item.product.toString());
      }
    }

    // No purchase history yet → fall back to newest active listings
    if (purchasedProductIds.length === 0) {
      const fallbackProducts = await Product.find({ isActive: true })
        .sort({ createdAt: -1 })
        .limit(limit);
      return res.status(200).json({ basedOn: "newest listings", count: fallbackProducts.length, products: fallbackProducts });
    }

    // Find what categories the buyer has bought from before
    const purchasedProducts = await Product.find({ _id: { $in: purchasedProductIds } });
    const categoryTally = {};
    for (const product of purchasedProducts) {
      categoryTally[product.category] = (categoryTally[product.category] || 0) + 1;
    }

    const topCategories = Object.entries(categoryTally)
      .sort((a, b) => b[1] - a[1])
      .map(([category]) => category);

    // Recommend active products in those categories, excluding ones already bought
    const recommended = await Product.find({
      category: { $in: topCategories },
      isActive: true,
      _id: { $nin: purchasedProductIds },
    }).limit(limit);

    res.status(200).json({ basedOn: "purchase history", count: recommended.length, products: recommended });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getCartRecommendations = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    const cart = await Cart.findOne({ buyer: req.user.id });
    if (!cart || cart.items.length === 0) {
      return res.status(200).json({ count: 0, products: [] });
    }

    const cartProductIds = cart.items.map((item) => item.product.toString());

    // For every product in the cart, find what's commonly bought alongside it
    const orders = await Order.find({ "items.product": { $in: cartProductIds } });

    const tally = {};
    for (const order of orders) {
      for (const item of order.items) {
        const itemProductId = item.product.toString();
        if (cartProductIds.includes(itemProductId)) continue; // skip things already in the cart
        tally[itemProductId] = (tally[itemProductId] || 0) + 1;
      }
    }

    const sortedIds = Object.entries(tally)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([id]) => id);

    const products = await Product.find({
      _id: { $in: sortedIds },
      isActive: true,
    });

    res.status(200).json({ count: products.length, products });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};