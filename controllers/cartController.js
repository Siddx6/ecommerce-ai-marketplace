import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

export const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ buyer: req.user.id }).populate(
      "items.product",
      "title price images stock isActive"
    );

    if (!cart) {
      cart = { buyer: req.user.id, items: [] };
    }

    res.status(200).json({ cart });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "productId is required" });
    }

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ message: "Product not found" });
    }

    let cart = await Cart.findOne({ buyer: req.user.id });
    if (!cart) {
      cart = await Cart.create({ buyer: req.user.id, items: [] });
    }

    const existingItem = cart.items.find((item) => item.product.toString() === productId);

    if (existingItem) {
      existingItem.quantity += quantity || 1;
    } else {
      cart.items.push({ product: productId, quantity: quantity || 1 });
    }

    await cart.save();
    res.status(200).json({ message: "Added to cart", cart });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (quantity === undefined || quantity < 1) {
      return res.status(400).json({ message: "quantity must be 1 or more" });
    }

    const cart = await Cart.findOne({ buyer: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const item = cart.items.find((item) => item.product.toString() === productId);
    if (!item) {
      return res.status(404).json({ message: "Item not in cart" });
    }

    item.quantity = quantity;
    await cart.save();

    res.status(200).json({ message: "Cart updated", cart });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ buyer: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = cart.items.filter((item) => item.product.toString() !== productId);
    await cart.save();

    res.status(200).json({ message: "Item removed from cart", cart });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};