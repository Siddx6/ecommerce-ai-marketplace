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
        <p className="text-slate-400">Your cart is empty.</p>
        <Link to="/" className="text-indigo-400 hover:underline text-sm">
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-white text-xl font-bold">Your Cart</h1>

      <div className="space-y-3">
        {cart.items.map((item) => (
          <div key={item._id} className="bg-slate-800 rounded-xl p-4 flex items-center justify-between">
            <div>
              <Link to={`/products/${item.product._id}`} className="text-white font-medium hover:underline">
                {item.product.title}
              </Link>
              <p className="text-slate-400 text-sm">₹{item.product.price} each</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                className="bg-slate-700 hover:bg-slate-600 text-white w-7 h-7 rounded-lg"
              >
                −
              </button>
              <span className="text-white w-6 text-center">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                className="bg-slate-700 hover:bg-slate-600 text-white w-7 h-7 rounded-lg"
              >
                +
              </button>

              <span className="text-white font-medium w-20 text-right">
                ₹{item.product.price * item.quantity}
              </span>

              <button
                onClick={() => removeItem(item.product._id)}
                className="text-red-400 hover:text-red-300 text-sm ml-2"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {recommendations.length > 0 && (
        <div>
          <h2 className="text-white font-semibold mb-2">You might also like</h2>
          <div className="flex gap-3 overflow-x-auto">
            {recommendations.map((p) => (
              <Link
                key={p._id}
                to={`/products/${p._id}`}
                className="bg-slate-800 rounded-lg p-3 min-w-[160px] hover:ring-2 hover:ring-indigo-500"
              >
                <p className="text-white text-sm font-medium truncate">{p.title}</p>
                <p className="text-slate-400 text-sm">₹{p.price}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-slate-700 pt-4">
        <span className="text-white text-lg font-bold">Total: ₹{total}</span>
        <button
          onClick={() => navigate("/checkout")}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg px-6 py-2 transition"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}

export default Cart;