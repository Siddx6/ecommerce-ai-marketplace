import Product from "../models/Product.js";
import { chatWithAssistant } from "../services/aiService.js";

export const chat = async (req, res) => {
  try {
    const { message, history, productId, cartProductIds } = req.body;

    if (!message) {
      return res.status(400).json({ message: "message is required" });
    }

    // If the buyer is on a specific product page, fetch its details
    let viewingProduct = null;
    if (productId) {
      const product = await Product.findById(productId);
      if (product && product.isActive) {
        viewingProduct = {
          title: product.title,
          description: product.description,
          price: product.price,
          stock: product.stock,
          category: product.category,
          subCategory: product.subCategory,
        };
      }
    }

    // If the buyer has items in their cart, fetch their details for context
    let cartItems = [];
    if (cartProductIds && cartProductIds.length > 0) {
      const cartProducts = await Product.find({ _id: { $in: cartProductIds } });
      cartItems = cartProducts.map((p) => ({ title: p.title, price: p.price }));
    }

    // Give the assistant a snapshot of what's actually available right now
    const catalogProducts = await Product.find({ isActive: true })
      .select("title price category subCategory stock")
      .limit(30);

    const catalogSnapshot = catalogProducts.map((p) => ({
      title: p.title,
      price: p.price,
      category: p.category,
      subCategory: p.subCategory,
      stock: p.stock,
    }));

    const reply = await chatWithAssistant({
      message,
      history: history || [],
      viewingProduct,
      cartItems,
      catalogSnapshot,
    });

    res.status(200).json({ reply });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};