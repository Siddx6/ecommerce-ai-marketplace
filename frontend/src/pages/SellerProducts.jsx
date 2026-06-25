import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import apiClient from "../api/client";

function SellerProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadProducts = () => {
    setLoading(true);
    apiClient
      .get("/products/my-products")
      .then((res) => setProducts(res.data.products))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadProducts();
  }, []);

  const toggleActive = async (product) => {
    if (product.isActive) {
      await apiClient.delete(`/products/${product._id}`);
    } else {
      await apiClient.patch(`/products/${product._id}`, { isActive: true });
    }
    loadProducts();
  };

  if (loading) return <p className="text-muted p-6">Loading...</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-cream">My Products ({products.length})</h1>
        <Link
          to="/sell/new"
          className="bg-coral text-coral-dark font-display font-bold text-sm rounded px-5 py-2.5 hover:opacity-90 transition"
        >
          + Add Product
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="text-muted">You haven't listed anything yet.</p>
      ) : (
        <div className="space-y-3">
          {products.map((p) => (
            <div key={p._id} className="bg-surface rounded p-5 flex items-center justify-between">
              <div>
                <p className="text-cream font-semibold">
                  {p.title}{" "}
                  {!p.isActive && <span className="text-coral text-xs font-bold ml-2">(Inactive)</span>}
                </p>
                <p className="font-mono text-muted text-sm mt-1">
                  ₹{p.price} <span className="font-sans">• {p.stock} in stock • {p.category}</span>
                </p>
              </div>

              <div className="flex items-center gap-4">
                <Link
                  to={`/sell/edit/${p._id}`}
                  className="text-coral hover:opacity-80 text-sm font-semibold transition"
                >
                  Edit
                </Link>
                <button
                  onClick={() => toggleActive(p)}
                  className={`text-sm font-semibold transition ${
                    p.isActive ? "text-coral hover:opacity-80" : "text-lime hover:opacity-80"
                  }`}
                >
                  {p.isActive ? "Deactivate" : "Reactivate"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SellerProducts;