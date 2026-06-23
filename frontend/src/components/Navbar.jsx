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
    <nav className="bg-surface border-b border-surface-light px-6 py-4 flex items-center gap-6">
      <Link to="/shop" className="font-display font-bold text-xl text-cream whitespace-nowrap">
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
          className="w-full rounded bg-ink border border-surface-light text-cream placeholder-muted px-4 py-2.5 outline-none focus:border-coral transition"
        />

        {showSuggestions && suggestions.length > 0 && (
          <ul className="absolute top-full left-0 right-0 mt-1 bg-surface border border-surface-light rounded overflow-hidden z-50">
            {suggestions.map((s, i) => (
              <li
                key={i}
                onMouseDown={() => selectSuggestion(s)}
                className="px-4 py-2.5 text-sm text-cream hover:bg-surface-light cursor-pointer"
              >
                {s}
              </li>
            ))}
          </ul>
        )}
      </form>

      <div className="flex items-center gap-5 ml-auto">
        {user?.role === "buyer" && (
          <Link to="/become-seller" className="text-muted hover:text-cream text-sm font-medium transition">
            Sell on ShopAI
          </Link>
        )}
        {user?.role === "seller" && (
          <Link to="/sell" className="text-muted hover:text-cream text-sm font-medium transition">
            My Products
          </Link>
        )}

        <Link to="/wishlist" className="text-muted hover:text-cream text-sm font-medium transition">
          Wishlist
        </Link>

        <Link to="/cart" className="relative text-muted hover:text-cream text-sm font-medium transition">
          Cart
          {itemCount > 0 && (
            <span className="absolute -top-2 -right-3 bg-coral text-coral-dark text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {itemCount}
            </span>
          )}
        </Link>

        {user ? (
          <>
            <Link to="/dashboard" className="text-cream text-sm font-semibold hover:text-coral transition">
              {user.name}
            </Link>
            <button
              onClick={logout}
              className="text-cream text-sm font-medium bg-ink hover:bg-surface-light border border-surface-light rounded px-4 py-2 transition"
            >
              Log out
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className="bg-coral text-coral-dark font-display font-bold text-sm rounded px-5 py-2.5 hover:opacity-90 transition"
          >
            Log in
          </Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;