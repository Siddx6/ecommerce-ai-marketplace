import Order from "../models/Order.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import { generateAnalyticsSummary } from "../services/aiService.js";
import PageView from "../models/PageView.js";

const computeSellerStats = async (sellerId) => {
  const orders = await Order.find({ "items.seller": sellerId });

  const sellerProducts = await Product.find({ seller: sellerId }).select("_id");
  const sellerProductIds = sellerProducts.map((p) => p._id);
  const totalViews = await PageView.countDocuments({ product: { $in: sellerProductIds } });

  let totalRevenue = 0;
  let totalUnitsSold = 0;
  const productTally = {};

  for (const order of orders) {
    for (const item of order.items) {
      if (item.seller.toString() !== sellerId) continue;

      const itemRevenue = item.price * item.quantity;
      totalRevenue += itemRevenue;
      totalUnitsSold += item.quantity;

      const key = item.product.toString();
      if (!productTally[key]) {
        productTally[key] = { title: item.title, unitsSold: 0, revenue: 0 };
      }
      productTally[key].unitsSold += item.quantity;
      productTally[key].revenue += itemRevenue;
    }
  }

  const topProducts = Object.values(productTally)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const conversionRate = totalViews > 0 ? Math.round((orders.length / totalViews) * 1000) / 10 : 0;

  return {
    totalOrders: orders.length,
    totalUnitsSold,
    totalRevenue,
    topProducts,
    totalViews,
    conversionRate,
  };
};

const computeAdminStats = async () => {
  const totalBuyers = await User.countDocuments({ role: "buyer" });
  const totalPlatformViews = await PageView.countDocuments();
  const totalSellers = await User.countDocuments({ role: "seller" });
  const totalAdmins = await User.countDocuments({ role: "admin" });
  const totalActiveProducts = await Product.countDocuments({ isActive: true });

  const allOrders = await Order.find();
  const totalOrders = allOrders.length;
  const totalGMV = allOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  // Group orders by day to show a real GMV trend over time
  const gmvByDay = {};
  for (const order of allOrders) {
    const day = order.createdAt.toISOString().split("T")[0]; // "2026-06-22"
    gmvByDay[day] = (gmvByDay[day] || 0) + order.totalAmount;
  }
  const gmvTrend = Object.entries(gmvByDay)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, gmv]) => ({ date, gmv }));

  const categoryTally = {};
  const sellerTally = {};

  for (const order of allOrders) {
    for (const item of order.items) {
      const itemRevenue = item.price * item.quantity;

      const sellerId = item.seller.toString();
      sellerTally[sellerId] = (sellerTally[sellerId] || 0) + itemRevenue;

      const product = await Product.findById(item.product).select("category");
      if (product) {
        categoryTally[product.category] = (categoryTally[product.category] || 0) + itemRevenue;
      }
    }
  }

  const topCategories = Object.entries(categoryTally)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([category, revenue]) => ({ category, revenue }));

  const topSellerIds = Object.entries(sellerTally)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const topSellers = await Promise.all(
    topSellerIds.map(async ([sellerId, revenue]) => {
      const seller = await User.findById(sellerId).select("name sellerProfile.storeName");
      return { sellerId, storeName: seller?.sellerProfile?.storeName || seller?.name, revenue };
    })
  );

  const platformConversionRate =
    totalPlatformViews > 0 ? Math.round((totalOrders / totalPlatformViews) * 1000) / 10 : 0;

  return {
    users: { totalBuyers, totalSellers, totalAdmins },
    totalActiveProducts,
    totalOrders,
    totalGMV,
    gmvTrend,
    topCategories,
    topSellers,
    totalPlatformViews,
    platformConversionRate,
  };
};

export const getSellerAnalytics = async (req, res) => {
  try {
    const stats = await computeSellerStats(req.user.id);
    res.status(200).json(stats);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getSellerAnalyticsSummary = async (req, res) => {
  try {
    const stats = await computeSellerStats(req.user.id);
    const summary = await generateAnalyticsSummary(stats);
    res.status(200).json({ stats, summary });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getAdminAnalytics = async (req, res) => {
  try {
    const stats = await computeAdminStats();
    res.status(200).json(stats);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getAdminAnalyticsSummary = async (req, res) => {
  try {
    const stats = await computeAdminStats();
    const summary = await generateAnalyticsSummary(stats);
    res.status(200).json({ stats, summary });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};