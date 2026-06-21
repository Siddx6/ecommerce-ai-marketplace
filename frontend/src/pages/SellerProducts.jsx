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

  if (loading) return <p className="text-slate-400 p-6">Loading...</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-white text-xl font-bold">My Products ({products.length})</h1>
        <Link
          to="/sell/new"
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg px-4 py-2 transition"
        >
          + Add Product
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="text-slate-400">You haven't listed anything yet.</p>
      ) : (
        <div className="space-y-3">
          {products.map((p) => (
            <div key={p._id} className="bg-slate-800 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-white font-medium">
                  {p.title}{" "}
                  {!p.isActive && <span className="text-red-400 text-xs ml-2">(Inactive)</span>}
                </p>
                <p className="text-slate-400 text-sm">
                  ₹{p.price} • {p.stock} in stock • {p.category}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  to={`/sell/edit/${p._id}`}
                  className="text-indigo-400 hover:text-indigo-300 text-sm"
                >
                  Edit
                </Link>
                <button
                  onClick={() => toggleActive(p)}
                  className={`text-sm ${p.isActive ? "text-red-400 hover:text-red-300" : "text-green-400 hover:text-green-300"}`}
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