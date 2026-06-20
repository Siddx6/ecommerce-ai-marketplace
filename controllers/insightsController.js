import Order from "../models/Order.js";
import Product from "../models/Product.js";

export const getMySegment = async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user.id });

    if (orders.length === 0) {
      return res.status(200).json({ segments: ["new_buyer"], stats: { totalOrders: 0, totalSpend: 0 } });
    }

    const totalOrders = orders.length;
    const totalSpend = orders.reduce((sum, o) => sum + o.totalAmount, 0);

    // Tally categories purchased, to detect a buyer's favorite category
    const productIds = [];
    for (const order of orders) {
      for (const item of order.items) {
        productIds.push(item.product.toString());
      }
    }
    const purchasedProducts = await Product.find({ _id: { $in: productIds } });
    const categoryTally = {};
    for (const product of purchasedProducts) {
      categoryTally[product.category] = (categoryTally[product.category] || 0) + 1;
    }
    const topCategory = Object.entries(categoryTally).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    const segments = [];
    if (totalOrders >= 3) segments.push("frequent_buyer");
    else segments.push("occasional_buyer");

    if (totalSpend >= 5000) segments.push("high_spender");

    if (topCategory && categoryTally[topCategory] >= 2) {
      segments.push(`${topCategory.toLowerCase()}_enthusiast`);
    }

    res.status(200).json({
      segments,
      stats: { totalOrders, totalSpend, topCategory },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};