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

  if (loading)
    return <p className="text-[#6B6B76] p-6 bg-[#F3F3F6] min-h-screen">Loading...</p>;

  if (items.length === 0) {
    return (
      <div className="p-10 text-center bg-[#F3F3F6] min-h-screen">
        <p className="text-[#6B6B76] mb-2">Your wishlist is empty.</p>
        <Link to="/shop" className="text-[#5B3DF5] font-semibold hover:underline text-sm">
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#F3F3F6] min-h-screen p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="font-display text-2xl font-bold text-[#1A1A22]">Your Wishlist</h1>

        {nudge && (
          <div className="bg-white border border-[#E4E4EA] rounded-lg p-5 border-t-4 border-t-[#5B3DF5]">
            <span className="inline-block bg-[#EDEBFF] text-[#5B3DF5] text-xs font-bold uppercase tracking-wide rounded px-2.5 py-1 mb-2">
              AI nudge
            </span>
            <p className="text-[#1A1A22] text-sm">{nudge}</p>
          </div>
        )}

        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item._id}
              className="bg-white border border-[#E4E4EA] rounded-lg p-5 flex items-center justify-between"
            >
              <div>
                <Link
                  to={`/products/${item.product._id}`}
                  className="text-[#1A1A22] font-semibold hover:text-[#5B3DF5] transition text-sm"
                >
                  {item.product.title}
                </Link>
                <p className="text-[#6B6B76] text-sm mt-1">
                  ₹{item.product.price}{" "}
                  {item.product.stock === 0 && (
                    <span className="text-[#C0392B]">• Out of stock</span>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => moveToCart(item.product._id)}
                  disabled={item.product.stock === 0}
                  className="bg-[#5B3DF5] hover:bg-[#4429D6] text-white font-semibold text-sm rounded-md px-4 py-2 disabled:opacity-50 transition"
                >
                  Add to Cart
                </button>
                <button
                  onClick={() => removeItem(item.product._id)}
                  className="text-[#C0392B] hover:opacity-80 text-sm font-semibold transition"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Wishlist;