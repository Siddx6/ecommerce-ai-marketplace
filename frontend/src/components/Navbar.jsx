import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import apiClient from "../api/client";

function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();
  const debounceTimer = useRef(null);

  useEffect(() => {
    if (!query.trim()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSuggestions([]);
      return;
    }

    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      apiClient
        .get(`/products/autocomplete?q=${encodeURIComponent(query.trim())}`)
        .then((res) => setSuggestions(res.data.suggestions))
        .catch(() => setSuggestions([]));
    }, 250);

    return () => clearTimeout(debounceTimer.current);
  }, [query]);

  const runSearch = (text) => {
    setShowSuggestions(false);
    if (text.trim()) {
      navigate(`/shop?q=${encodeURIComponent(text.trim())}`);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    runSearch(query);
  };

  const selectSuggestion = (suggestion) => {
    setQuery(suggestion);
    runSearch(suggestion);
  };

  return (
    <nav className="bg-slate-800 border-b border-slate-700 px-6 py-3 flex items-center gap-6">
      <Link to="/shop" className="text-white font-bold text-lg whitespace-nowrap">
        ShopAI
      </Link>

      <form onSubmit={handleSearch} className="flex-1 max-w-xl relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          placeholder="Search products..."
          className="w-full rounded-lg bg-slate-700 text-white placeholder-slate-400 px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
        />

        {showSuggestions && suggestions.length > 0 && (
          <ul className="absolute top-full left-0 right-0 mt-1 bg-slate-700 rounded-lg shadow-lg overflow-hidden z-50">
            {suggestions.map((s, i) => (
              <li
                key={i}
                onMouseDown={() => selectSuggestion(s)}
                className="px-4 py-2 text-sm text-white hover:bg-slate-600 cursor-pointer"
              >
                {s}
              </li>
            ))}
          </ul>
        )}
      </form>

      <div className="flex items-center gap-4 ml-auto">
        {user?.role === "buyer" && (
          <Link to="/become-seller" className="text-slate-300 hover:text-white text-sm">
            Sell on ShopAI
          </Link>
        )}
        {user?.role === "seller" && (
          <Link to="/sell" className="text-slate-300 hover:text-white text-sm">
            My Products
          </Link>
        )}

        <Link to="/wishlist" className="text-slate-300 hover:text-white text-sm">
          Wishlist
        </Link>

        <Link to="/cart" className="relative text-slate-300 hover:text-white text-sm">
          Cart
          {itemCount > 0 && (
            <span className="absolute -top-2 -right-3 bg-indigo-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {itemCount}
            </span>
          )}
        </Link>

        {user ? (
          <>
            <Link to="/dashboard" className="text-slate-300 hover:text-white text-sm">
              {user.name}
            </Link>
            <button
              onClick={logout}
              className="text-slate-300 hover:text-white text-sm bg-slate-700 hover:bg-slate-600 rounded-lg px-3 py-1.5 transition"
            >
              Log out
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-lg px-4 py-1.5 transition"
          >
            Log in
          </Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;