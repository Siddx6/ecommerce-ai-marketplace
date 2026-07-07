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

  const total = cart.items.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0
  );

  if (cart.items.length === 0) {
    return (
      <div className="p-10 text-center bg-[#F3F3F6] min-h-screen">
        <p className="text-[#6B6B76] mb-2">Your cart is empty.</p>
        <Link to="/shop" className="text-[#5B3DF5] font-semibold hover:underline text-sm">
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#F3F3F6] min-h-screen p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="font-display text-2xl font-bold text-[#1A1A22]">Your Cart</h1>

        <div className="space-y-3">
          {cart.items.map((item) => (
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
                <p className="text-[#6B6B76] text-xs mt-1">₹{item.product.price} each</p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                  className="bg-[#F3F3F6] border border-[#E4E4EA] hover:border-[#5B3DF5] text-[#1A1A22] w-7 h-7 rounded-md transition"
                >
                  −
                </button>
                <span className="text-[#1A1A22] font-semibold w-6 text-center text-sm">
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                  className="bg-[#F3F3F6] border border-[#E4E4EA] hover:border-[#5B3DF5] text-[#1A1A22] w-7 h-7 rounded-md transition"
                >
                  +
                </button>

                <span className="text-[#1A1A22] font-bold w-20 text-right text-sm">
                  ₹{item.product.price * item.quantity}
                </span>

                <button
                  onClick={() => removeItem(item.product._id)}
                  className="text-[#C0392B] hover:opacity-80 text-xs font-semibold ml-2 transition"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {recommendations.length > 0 && (
          <div>
            <h2 className="font-display font-bold text-[#1A1A22] mb-3 text-sm">
              You might also like
            </h2>
            <div className="flex gap-3 overflow-x-auto">
              {recommendations.map((p) => (
                <Link
                  key={p._id}
                  to={`/products/${p._id}`}
                  className="bg-white border border-[#E4E4EA] rounded-lg p-4 min-w-[160px] hover:shadow-md transition"
                >
                  <p className="text-[#1A1A22] text-sm font-semibold truncate">{p.title}</p>
                  <p className="text-[#5B3DF5] text-sm font-bold mt-1">₹{p.price}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-[#E4E4EA] pt-5">
          <span className="font-display text-[#1A1A22] text-xl font-bold">
            Total: <span className="text-[#5B3DF5]">₹{total}</span>
          </span>
          <button
            onClick={() => navigate("/checkout")}
            className="bg-[#FFA41C] hover:bg-[#E68A00] text-[#14161C] font-display font-bold rounded-md px-7 py-3 transition"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Cart;