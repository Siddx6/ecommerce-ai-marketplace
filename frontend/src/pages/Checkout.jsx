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
      <div className="p-6 max-w-lg mx-auto text-center space-y-5">
        <span className="inline-block bg-lime text-lime-dark text-xs font-bold uppercase tracking-wider rounded px-2.5 py-1">
          Order placed
        </span>
        <h1 className="font-display text-3xl font-bold text-cream">You're all set.</h1>
        <p className="text-muted">
          Your order total was <span className="font-mono text-coral">₹{placedOrder.totalAmount}</span>.
        </p>
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-coral text-coral-dark font-display font-bold rounded px-7 py-3 hover:opacity-90 transition"
        >
          View Order History
        </button>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return <p className="text-muted p-6 text-center">Your cart is empty.</p>;
  }

  return (
    <div className="p-6 max-w-lg mx-auto space-y-6">
      <h1 className="font-display text-2xl font-bold text-cream">Checkout</h1>

      <div className="bg-surface rounded p-5 space-y-2.5">
        {cart.items.map((item) => (
          <div key={item._id} className="flex justify-between text-sm">
            <span className="text-cream">
              {item.product.title} x{item.quantity}
            </span>
            <span className="font-mono text-coral">₹{item.product.price * item.quantity}</span>
          </div>
        ))}
        <div className="border-t border-surface-light pt-3 flex justify-between font-semibold">
          <span className="text-cream font-display">Total</span>
          <span className="font-mono text-coral text-lg">₹{total}</span>
        </div>
      </div>

      {error && (
        <div className="bg-coral/10 text-coral text-sm rounded px-4 py-2.5 font-medium">{error}</div>
      )}

      <form onSubmit={handlePlaceOrder} className="space-y-4">
        <div>
          <label className="block text-xs uppercase tracking-wider font-semibold text-muted mb-2">
            Shipping Address
          </label>
          <textarea
            value={shippingAddress}
            onChange={(e) => setShippingAddress(e.target.value)}
            required
            rows={3}
            className="w-full rounded bg-ink border border-surface-light text-cream px-4 py-3 outline-none focus:border-coral transition"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-coral text-coral-dark font-display font-bold rounded py-3.5 hover:opacity-90 disabled:opacity-50 transition"
        >
          {loading ? "Placing order..." : "Place Order"}
        </button>
      </form>
    </div>
  );
}

export default Checkout;