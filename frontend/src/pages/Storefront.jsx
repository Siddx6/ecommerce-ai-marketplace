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

    Promise.all([
      fetchProducts,
      apiClient.get("/products/filters", {
        params: category ? { category } : {},
      }),
    ])
      .then(([productsRes, filtersRes]) => {
        setProducts(productsRes.data.products);
        if (productsRes.data.interpretedAs)
          setInterpretedAs(productsRes.data.interpretedAs);
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
    <div className="flex gap-6 p-6 bg-[#F3F3F6] min-h-screen">
      <aside className="w-52 shrink-0 bg-white border border-[#E4E4EA] rounded-lg p-4 h-fit">
        <h2 className="font-display font-bold text-[#1A1A22] text-sm mb-3">
          Categories
        </h2>
        <ul className="space-y-1">
          {categories.map((cat) => (
            <li key={cat}>
              <button
                onClick={() => selectCategory(cat)}
                className={`text-xs w-full text-left px-3 py-2 rounded-md transition font-medium ${
                  cat === category
                    ? "bg-[#EDEBFF] text-[#5B3DF5]"
                    : "text-[#6B6B76] hover:bg-[#F3F3F6]"
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
          <p className="text-[#6B6B76] text-sm mb-4">
            Showing results for{" "}
            <span className="text-[#1A1A22] font-semibold">"{q}"</span>
            {interpretedAs?.maxPrice && (
              <span> under ₹{interpretedAs.maxPrice}</span>
            )}
          </p>
        )}

        {loading ? (
          <p className="text-[#6B6B76] text-sm">Loading products...</p>
        ) : products.length === 0 ? (
          <p className="text-[#6B6B76] text-sm">No products found.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
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