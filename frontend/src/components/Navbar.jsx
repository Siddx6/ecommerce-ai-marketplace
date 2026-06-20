import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <nav className="bg-slate-800 border-b border-slate-700 px-6 py-3 flex items-center gap-6">
      <Link to="/" className="text-white font-bold text-lg whitespace-nowrap">
        ShopAI
      </Link>

      <form onSubmit={handleSearch} className="flex-1 max-w-xl">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products..."
          className="w-full rounded-lg bg-slate-700 text-white placeholder-slate-400 px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </form>

      <div className="flex items-center gap-4 ml-auto">
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