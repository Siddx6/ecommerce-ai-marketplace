import Wishlist from "../models/Wishlist.js";
import Notification from "../models/Notification.js";

export const checkAndNotifyWishlist = async (product, previousStock, previousPrice) => {
  try {
    const backInStock = previousStock === 0 && product.stock > 0;
    const priceDropped = previousPrice > product.price;

    if (!backInStock && !priceDropped) {
      return; // nothing changed that buyers would care about
    }

    // Find every buyer who has this product wishlisted
    const wishlists = await Wishlist.find({ "items.product": product._id });

    for (const wishlist of wishlists) {
      if (backInStock) {
        await Notification.create({
          buyer: wishlist.buyer,
          product: product._id,
          type: "back_in_stock",
          message: `${product.title} is back in stock!`,
        });
      }

      if (priceDropped) {
        await Notification.create({
          buyer: wishlist.buyer,
          product: product._id,
          type: "price_drop",
          message: `Price drop! ${product.title} is now ₹${product.price} (was ₹${previousPrice}).`,
        });
      }
    }
  } catch (err) {
    console.log("Notification check failed:", err.message);
    // Don't throw — a failed notification shouldn't block the seller's product update
  }
};