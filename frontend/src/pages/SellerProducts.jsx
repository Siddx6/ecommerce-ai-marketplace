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

  if (loading)
    return <p className="text-[#6B6B76] p-6 bg-[#F3F3F6] min-h-screen">Loading...</p>;

  return (
    <div className="bg-[#F3F3F6] min-h-screen p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold text-[#1A1A22]">
            My Products ({products.length})
          </h1>
          <Link
            to="/sell/new"
            className="bg-[#5B3DF5] hover:bg-[#4429D6] text-white font-display font-bold text-sm rounded-md px-5 py-2.5 transition"
          >
            + Add Product
          </Link>
        </div>

        {products.length === 0 ? (
          <p className="text-[#6B6B76]">You haven't listed anything yet.</p>
        ) : (
          <div className="space-y-3">
            {products.map((p) => (
              <div
                key={p._id}
                className="bg-white border border-[#E4E4EA] rounded-lg p-5 flex items-center justify-between"
              >
                <div>
                  <p className="text-[#1A1A22] font-semibold text-sm">
                    {p.title}{" "}
                    {!p.isActive && (
                      <span className="text-[#C0392B] text-xs font-bold ml-2">
                        (Inactive)
                      </span>
                    )}
                  </p>
                  <p className="text-[#6B6B76] text-sm mt-1">
                    ₹{p.price} • {p.stock} in stock • {p.category}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <Link
                    to={`/sell/edit/${p._id}`}
                    className="text-[#5B3DF5] hover:opacity-80 text-sm font-semibold transition"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => toggleActive(p)}
                    className={`text-sm font-semibold transition ${
                      p.isActive
                        ? "text-[#C0392B] hover:opacity-80"
                        : "text-[#1D9E75] hover:opacity-80"
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
    </div>
  );
}

export default SellerProducts;