import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import apiClient from "../api/client";
import { useCart } from "../context/CartContext";

function Wishlist() {
  const [items, setItems] = useState([]);
  const [nudge, setNudge] = useState(null);
  const [loading, setLoading] = useState(true);
  const { refreshCart } = useCart();

  const loadWishlist = () => {
    setLoading(true);
    Promise.all([apiClient.get("/wishlist"), apiClient.get("/wishlist/nudge")])
      .then(([wishlistRes, nudgeRes]) => {
        setItems(wishlistRes.data.wishlist.items || []);
        setNudge(nudgeRes.data.nudge);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadWishlist();
  }, []);

  const removeItem = async (productId) => {
    await apiClient.delete(`/wishlist/${productId}`);
    loadWishlist();
  };

  const moveToCart = async (productId) => {
    await apiClient.post("/cart", { productId, quantity: 1 });
    await refreshCart();
    await removeItem(productId);
  };

  if (loading) return <p className="text-muted p-6">Loading...</p>;

  if (items.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted">Your wishlist is empty.</p>
        <Link to="/shop" className="text-coral font-semibold hover:underline text-sm">
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="font-display text-2xl font-bold text-cream">Your Wishlist</h1>

      {nudge && (
        <div className="bg-surface rounded p-5 border-t-[3px] border-lime">
          <span className="inline-block bg-lime text-lime-dark text-xs font-bold uppercase tracking-wider rounded px-2.5 py-1 mb-2">
            AI nudge
          </span>
          <p className="text-cream text-sm">{nudge}</p>
        </div>
      )}

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item._id} className="bg-surface rounded p-5 flex items-center justify-between">
            <div>
              <Link to={`/products/${item.product._id}`} className="text-cream font-semibold hover:text-coral transition">
                {item.product.title}
              </Link>
              <p className="font-mono text-muted text-sm mt-1">
                ₹{item.product.price}{" "}
                {item.product.stock === 0 && <span className="text-coral font-sans">• Out of stock</span>}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => moveToCart(item.product._id)}
                disabled={item.product.stock === 0}
                className="bg-coral text-coral-dark font-display font-bold text-sm rounded px-4 py-2 hover:opacity-90 disabled:opacity-50 transition"
              >
                Add to Cart
              </button>
              <button
                onClick={() => removeItem(item.product._id)}
                className="text-coral hover:opacity-80 text-sm font-semibold transition"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Wishlist;