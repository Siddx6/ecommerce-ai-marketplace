import Wishlist from "../models/Wishlist.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import { sendEmail } from "./emailService.js";

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
      const buyer = await User.findById(wishlist.buyer);
      if (!buyer) continue;

      if (backInStock) {
        const message = `${product.title} is back in stock!`;
        await Notification.create({
          buyer: wishlist.buyer,
          product: product._id,
          type: "back_in_stock",
          message,
        });
        await sendEmail({ to: buyer.email, subject: "Back in stock!", text: message });
      }

      if (priceDropped) {
        const message = `Price drop! ${product.title} is now ₹${product.price} (was ₹${previousPrice}).`;
        await Notification.create({
          buyer: wishlist.buyer,
          product: product._id,
          type: "price_drop",
          message,
        });
        await sendEmail({ to: buyer.email, subject: "Price drop on your wishlist item!", text: message });
      }
    }
  } catch (err) {
    console.log("Notification check failed:", err.message);
    // Don't throw — a failed notification shouldn't block the seller's product update
  }
};