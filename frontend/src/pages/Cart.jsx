import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiClient from "../api/client";
import { useCart } from "../context/CartContext";

function Cart() {
  const { cart, refreshCart } = useCart();
  const [recommendations, setRecommendations] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    apiClient.get("/recommendations/cart").then((res) => setRecommendations(res.data.products));
  }, [cart]);

  const updateQuantity = async (productId, quantity) => {
    if (quantity < 1) return;
    await apiClient.patch(`/cart/${productId}`, { quantity });
    await refreshCart();
  };

  const removeItem = async (productId) => {
    await apiClient.delete(`/cart/${productId}`);
    await refreshCart();
  };

  const total = cart.items.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);

  if (cart.items.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted">Your cart is empty.</p>
        <Link to="/shop" className="text-coral font-semibold hover:underline text-sm">
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="font-display text-2xl font-bold text-cream">Your Cart</h1>

      <div className="space-y-3">
        {cart.items.map((item) => (
          <div key={item._id} className="bg-surface rounded p-5 flex items-center justify-between">
            <div>
              <Link to={`/products/${item.product._id}`} className="text-cream font-semibold hover:text-coral transition">
                {item.product.title}
              </Link>
              <p className="font-mono text-muted text-sm mt-1">₹{item.product.price} each</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                className="bg-ink border border-surface-light hover:border-coral text-cream w-7 h-7 rounded transition"
              >
                −
              </button>
              <span className="text-cream font-semibold w-6 text-center">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                className="bg-ink border border-surface-light hover:border-coral text-cream w-7 h-7 rounded transition"
              >
                +
              </button>

              <span className="font-mono text-coral font-medium w-20 text-right">
                ₹{item.product.price * item.quantity}
              </span>

              <button
                onClick={() => removeItem(item.product._id)}
                className="text-coral hover:opacity-80 text-sm font-semibold ml-2 transition"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {recommendations.length > 0 && (
        <div>
          <h2 className="font-display font-bold text-cream mb-3">You might also like</h2>
          <div className="flex gap-3 overflow-x-auto">
            {recommendations.map((p) => (
              <Link
                key={p._id}
                to={`/products/${p._id}`}
                className="bg-surface rounded p-4 min-w-[160px] hover:ring-2 hover:ring-coral transition"
              >
                <p className="text-cream text-sm font-semibold truncate">{p.title}</p>
                <p className="font-mono text-coral text-sm mt-1">₹{p.price}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-surface-light pt-5">
        <span className="font-display text-cream text-xl font-bold">
          Total: <span className="font-mono text-coral">₹{total}</span>
        </span>
        <button
          onClick={() => navigate("/checkout")}
          className="bg-coral text-coral-dark font-display font-bold rounded px-7 py-3 hover:opacity-90 transition"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}

export default Cart;