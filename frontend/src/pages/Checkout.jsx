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

  const total = cart.items.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0
  );

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
      <div className="bg-[#F3F3F6] min-h-screen flex items-center justify-center p-6">
        <div className="max-w-lg text-center space-y-5">
          <span className="inline-block bg-[#DFF5EC] text-[#1D9E75] text-xs font-bold uppercase tracking-wide rounded px-2.5 py-1">
            Order placed
          </span>
          <h1 className="font-display text-3xl font-bold text-[#1A1A22]">
            You're all set.
          </h1>
          <p className="text-[#6B6B76]">
            Your order total was{" "}
            <span className="text-[#5B3DF5] font-bold">₹{placedOrder.totalAmount}</span>.
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-[#5B3DF5] hover:bg-[#4429D6] text-white font-display font-bold rounded-md px-7 py-3 transition"
          >
            View Order History
          </button>
        </div>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <p className="text-[#6B6B76] p-10 text-center bg-[#F3F3F6] min-h-screen">
        Your cart is empty.
      </p>
    );
  }

  return (
    <div className="bg-[#F3F3F6] min-h-screen p-6">
      <div className="max-w-lg mx-auto space-y-6">
        <h1 className="font-display text-2xl font-bold text-[#1A1A22]">Checkout</h1>

        <div className="bg-white border border-[#E4E4EA] rounded-lg p-5 space-y-2.5">
          {cart.items.map((item) => (
            <div key={item._id} className="flex justify-between text-sm">
              <span className="text-[#1A1A22]">
                {item.product.title} x{item.quantity}
              </span>
              <span className="text-[#1A1A22] font-semibold">
                ₹{item.product.price * item.quantity}
              </span>
            </div>
          ))}
          <div className="border-t border-[#E4E4EA] pt-3 flex justify-between font-semibold">
            <span className="text-[#1A1A22] font-display">Total</span>
            <span className="text-[#5B3DF5] text-lg font-bold">₹{total}</span>
          </div>
        </div>

        {error && (
          <div className="bg-[#FCEBEB] text-[#791F1F] text-sm rounded-md px-4 py-2.5 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handlePlaceOrder} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wide font-semibold text-[#6B6B76] mb-2">
              Shipping Address
            </label>
            <textarea
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              required
              rows={3}
              className="w-full rounded-md bg-white border border-[#E4E4EA] text-[#1A1A22] px-4 py-3 outline-none focus:border-[#5B3DF5] transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FFA41C] hover:bg-[#E68A00] text-[#14161C] font-display font-bold rounded-md py-3.5 disabled:opacity-50 transition"
          >
            {loading ? "Placing order..." : "Place Order"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Checkout;