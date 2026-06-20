import { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/client";
import { useCart } from "../context/CartContext";

function Checkout() {
  const [shippingAddress, setShippingAddress] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);
  const { cart, refreshCart } = useCart();
  const navigate = useNavigate();

  const total = cart.items.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await apiClient.post("/orders/checkout", { shippingAddress });
      setPlacedOrder(res.data.order);
      await refreshCart();
    } catch (err) {
      setError(err.response?.data?.message || "Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  if (placedOrder) {
    return (
      <div className="p-6 max-w-lg mx-auto text-center space-y-4">
        <h1 className="text-2xl font-bold text-white">Order placed! 🎉</h1>
        <p className="text-slate-400">
          Your order total was <span className="text-white">₹{placedOrder.totalAmount}</span>.
        </p>
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg px-6 py-2 transition"
        >
          View Order History
        </button>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return <p className="text-slate-400 p-6 text-center">Your cart is empty.</p>;
  }

  return (
    <div className="p-6 max-w-lg mx-auto space-y-6">
      <h1 className="text-white text-xl font-bold">Checkout</h1>

      <div className="bg-slate-800 rounded-xl p-4 space-y-2">
        {cart.items.map((item) => (
          <div key={item._id} className="flex justify-between text-sm text-slate-300">
            <span>
              {item.product.title} x{item.quantity}
            </span>
            <span>₹{item.product.price * item.quantity}</span>
          </div>
        ))}
        <div className="border-t border-slate-700 pt-2 flex justify-between text-white font-semibold">
          <span>Total</span>
          <span>₹{total}</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 text-red-400 text-sm rounded-lg px-4 py-2">{error}</div>
      )}

      <form onSubmit={handlePlaceOrder} className="space-y-4">
        <div>
          <label className="block text-sm text-slate-300 mb-1">Shipping Address</label>
          <textarea
            value={shippingAddress}
            onChange={(e) => setShippingAddress(e.target.value)}
            required
            rows={3}
            className="w-full rounded-lg bg-slate-700 text-white px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-lg py-2 transition"
        >
          {loading ? "Placing order..." : "Place Order"}
        </button>
      </form>
    </div>
  );
}

export default Checkout;