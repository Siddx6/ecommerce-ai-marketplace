import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

export const checkout = async (req, res) => {
  try {
    const { shippingAddress } = req.body;

    if (!shippingAddress) {
      return res.status(400).json({ message: "shippingAddress is required" });
    }

    const cart = await Cart.findOne({ buyer: req.user.id }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const orderItems = [];
    let totalAmount = 0;

    // First pass: validate stock for every item before changing anything
    for (const item of cart.items) {
      const product = item.product;

      if (!product || !product.isActive) {
        return res.status(400).json({ message: `Product no longer available: ${item.product?.title || item.product}` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Not enough stock for "${product.title}". Available: ${product.stock}, requested: ${item.quantity}`,
        });
      }
    }

    // Second pass: deduct stock and build order items
    for (const item of cart.items) {
      const product = item.product;

      product.stock -= item.quantity;
      await product.save();

      orderItems.push({
        product: product._id,
        seller: product.seller,
        title: product.title,
        price: product.price,
        quantity: item.quantity,
        status: "pending",
      });

      totalAmount += product.price * item.quantity;
    }

    const order = await Order.create({
      buyer: req.user.id,
      items: orderItems,
      totalAmount,
      shippingAddress,
    });

    cart.items = [];
    await cart.save();

    res.status(201).json({ message: "Order placed", order });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ count: orders.length, orders });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getSellerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ "items.seller": req.user.id })
      .populate("buyer", "name email")
      .sort({ createdAt: -1 });

    // Only show this seller their own items within each order, not other sellers' items
    const filtered = orders.map((order) => ({
      _id: order._id,
      buyer: order.buyer,
      shippingAddress: order.shippingAddress,
      createdAt: order.createdAt,
      items: order.items.filter((item) => item.seller.toString() === req.user.id),
    }));

    res.status(200).json({ count: filtered.length, orders: filtered });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const updateOrderItemStatus = async (req, res) => {
  try {
    const { orderId, itemId } = req.params;
    const { status } = req.body;

    const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const item = order.items.find((i) => i._id.toString() === itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found in this order" });
    }

    if (item.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only update your own items" });
    }

    item.status = status;
    await order.save();

    res.status(200).json({ message: "Item status updated", item });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};