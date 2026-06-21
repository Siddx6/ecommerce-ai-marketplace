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

  if (loading) return <p className="text-slate-400 p-6">Loading...</p>;

  if (items.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-slate-400">Your wishlist is empty.</p>
        <Link to="/" className="text-indigo-400 hover:underline text-sm">
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-white text-xl font-bold">Your Wishlist</h1>

      {nudge && (
        <div className="bg-indigo-600/10 border border-indigo-500/30 rounded-xl p-4">
          <p className="text-indigo-300 text-sm">{nudge}</p>
        </div>
      )}

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item._id} className="bg-slate-800 rounded-xl p-4 flex items-center justify-between">
            <div>
              <Link to={`/products/${item.product._id}`} className="text-white font-medium hover:underline">
                {item.product.title}
              </Link>
              <p className="text-slate-400 text-sm">
                ₹{item.product.price}{" "}
                {item.product.stock === 0 && <span className="text-red-400">• Out of stock</span>}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => moveToCart(item.product._id)}
                disabled={item.product.stock === 0}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm rounded-lg px-4 py-1.5 transition"
              >
                Add to Cart
              </button>
              <button
                onClick={() => removeItem(item.product._id)}
                className="text-red-400 hover:text-red-300 text-sm"
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