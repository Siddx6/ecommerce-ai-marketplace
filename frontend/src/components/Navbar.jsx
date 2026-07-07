import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import apiClient from "../api/client";

const CATEGORIES = [
  { label: "Fashion", icon: "👕" },
  { label: "Mobiles", icon: "📱" },
  { label: "Electronics", icon: "💻" },
  { label: "Home", icon: "🏠" },
  { label: "Appliances", icon: "🔌" },
  { label: "Toys", icon: "🧸" },
  { label: "Books", icon: "📚" },
  { label: "Beauty", icon: "💄" },
  { label: "AI picks", icon: "🤖" },
];

function Navbar() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef(null);

  const cartCount = cart?.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;

  useEffect(() => {
    if (!query.trim()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSuggestions([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await apiClient.get(
          `/api/products/autocomplete?q=${encodeURIComponent(query)}`
        );
        setSuggestions(res.data || []);
      } catch {
        setSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setShowSuggestions(false);
    navigate(`/shop?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="sticky top-0 z-50">
      {/* Utility bar */}
      <div className="bg-[#14161C] text-white text-xs px-6 py-1.5 flex justify-between">
        <span className="opacity-75">Delivering to your location · Update</span>
        <span className="opacity-75">Track order · Help center</span>
      </div>

      {/* Main nav */}
      <div className="bg-[#5B3DF5] px-6 py-3 flex items-center gap-5">
        <Link
  to="/shop"
  className="font-display text-white font-bold text-xl whitespace-nowrap"
>
          Shop<span className="text-[#FFA41C]">AI</span>
        </Link>

        <form
          onSubmit={handleSearch}
          className="flex-1 max-w-xl relative"
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
        >
          <div className="flex rounded-md overflow-hidden">
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Search products, brands and more"
              className="flex-1 px-3 py-2 text-sm outline-none bg-white text-[#1A1A22] placeholder-[#9B9BA6]"
            />
            <button
              type="submit"
              className="bg-[#FFA41C] px-4 font-semibold text-sm text-[#14161C]"
            >
              Search
            </button>
          </div>

          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white border border-[#E4E4EA] rounded-md mt-1 shadow-lg overflow-hidden">
              {suggestions.map((s) => (
                <button
                  key={s._id}
                  type="button"
                  onMouseDown={() => {
                    setQuery(s.name);
                    setShowSuggestions(false);
                    navigate(`/products/${s._id}`);
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-[#F3F3F6] text-[#1A1A22]"
                >
                  {s.name}
                </button>
              ))}
            </div>
          )}
        </form>

        <div className="flex items-center gap-5 text-white text-xs whitespace-nowrap ml-auto">
          {user ? (
            <>
              <Link to="/dashboard" className="font-semibold hover:underline">
                {user.name}
              </Link>

              <Link to="/wishlist" className="flex flex-col items-center">
                ♡<span className="text-[10px]">Wishlist</span>
              </Link>

              {user.role === "seller" && (
                <Link to="/sell" className="font-semibold">
                  My Products
                </Link>
              )}
              {user.role === "buyer" && (
                <Link to="/become-seller" className="font-semibold">
                  Become a Seller
                </Link>
              )}
              {user.role === "admin" && (
  <Link to="/dashboard" className="font-semibold">
    Admin
  </Link>
)}

              <Link to="/cart" className="flex items-center gap-1 font-semibold">
                🛒
                {cartCount > 0 && (
                  <span className="bg-[#FFA41C] text-[#14161C] rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold">
                    {cartCount}
                  </span>
                )}
                Cart
              </Link>

              <button
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
                className="bg-white text-[#5B3DF5] font-semibold px-3 py-1.5 rounded-md text-xs"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="font-semibold">
                Sign in
              </Link>
              <Link to="/signup" className="font-semibold">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Category strip */}
      <div className="bg-white border-b border-[#E4E4EA] px-6 py-2.5 flex gap-7 overflow-x-auto text-xs font-medium text-[#6B6B76]">
        {CATEGORIES.map((c) => (
          <Link
            key={c.label}
            to={`/shop?category=${encodeURIComponent(c.label)}`}
            className="flex flex-col items-center gap-1 hover:text-[#5B3DF5] shrink-0"
          >
            <span className="w-6 h-6 rounded-md bg-[#EDEBFF] flex items-center justify-center text-sm">
              {c.icon}
            </span>
            {c.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Navbar;