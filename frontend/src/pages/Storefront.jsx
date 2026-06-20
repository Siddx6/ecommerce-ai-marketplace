import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import apiClient from "../api/client";
import ProductCard from "../components/ProductCard";

function Storefront() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [interpretedAs, setInterpretedAs] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setInterpretedAs(null);

    const fetchProducts = q
      ? apiClient.get(`/products/smart-search?q=${encodeURIComponent(q)}`)
      : apiClient.get("/products", { params: category ? { category } : {} });

    Promise.all([fetchProducts, apiClient.get("/products/filters", { params: category ? { category } : {} })])
      .then(([productsRes, filtersRes]) => {
        setProducts(productsRes.data.products);
        if (productsRes.data.interpretedAs) setInterpretedAs(productsRes.data.interpretedAs);
        setCategories(filtersRes.data.categories);
      })
      .finally(() => setLoading(false));
  }, [q, category]);

  const selectCategory = (cat) => {
    if (cat === category) {
      searchParams.delete("category");
    } else {
      searchParams.set("category", cat);
    }
    searchParams.delete("q");
    setSearchParams(searchParams);
  };

  return (
    <div className="flex gap-6 p-6">
      <aside className="w-48 shrink-0">
        <h2 className="text-white font-semibold mb-3">Categories</h2>
        <ul className="space-y-1">
          {categories.map((cat) => (
            <li key={cat}>
              <button
                onClick={() => selectCategory(cat)}
                className={`text-sm w-full text-left px-2 py-1 rounded-lg transition ${
                  cat === category ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                {cat}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <main className="flex-1">
        {q && (
          <p className="text-slate-400 text-sm mb-4">
            Showing results for <span className="text-white">"{q}"</span>
            {interpretedAs?.maxPrice && <span> under ₹{interpretedAs.maxPrice}</span>}
          </p>
        )}

        {loading ? (
          <p className="text-slate-400">Loading products...</p>
        ) : products.length === 0 ? (
          <p className="text-slate-400">No products found.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Storefront;