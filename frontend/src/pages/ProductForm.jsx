import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../api/client";

function ProductForm() {
  const { productId } = useParams();
  const isEditing = Boolean(productId);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    subCategory: "",
  });
  const [error, setError] = useState("");
  const [keyFeatures, setKeyFeatures] = useState("");
  const [generating, setGenerating] = useState(false);
  const [tagging, setTagging] = useState(false);
  const [benchmark, setBenchmark] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(isEditing);

  useEffect(() => {
    if (isEditing) {
      apiClient.get(`/products/${productId}`).then((res) => {
        const p = res.data.product;
        setForm({
          title: p.title,
          description: p.description,
          price: p.price,
          stock: p.stock,
          category: p.category,
          subCategory: p.subCategory || "",
        });
        setLoadingProduct(false);
      });
    }
  }, [productId, isEditing]);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const generateCopy = async () => {
    if (!form.title || !form.category) {
      setError("Enter a rough title and category first, then generate");
      return;
    }
    setGenerating(true);
    try {
      const res = await apiClient.post("/seller-tools/generate-copy", {
        roughTitle: form.title,
        category: form.category,
        keyFeatures,
      });
      updateField("title", res.data.generated.title);
      updateField("description", res.data.generated.description);
    } finally {
      setGenerating(false);
    }
  };

  const autoTag = async () => {
    if (!form.title || !form.description) {
      setError("Enter a title and description first, then auto-tag");
      return;
    }
    setTagging(true);
    try {
      const res = await apiClient.post("/seller-tools/auto-tag", {
        title: form.title,
        description: form.description,
      });
      updateField("category", res.data.suggestion.category);
      updateField("subCategory", res.data.suggestion.subCategory);
    } finally {
      setTagging(false);
    }
  };

  const fetchBenchmark = async () => {
    if (!form.category) return;
    try {
      const res = await apiClient.get("/seller-tools/pricing-benchmark", {
        params: { category: form.category, subCategory: form.subCategory || undefined },
      });
      setBenchmark(res.data.benchmark);
    } catch {
      setBenchmark(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = { ...form, price: Number(form.price), stock: Number(form.stock) };
      if (isEditing) {
        await apiClient.patch(`/products/${productId}`, payload);
      } else {
        await apiClient.post("/products", payload);
      }
      navigate("/sell");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (loadingProduct) return <p className="text-slate-400 p-6">Loading...</p>;

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-xl font-bold text-white mb-6">
        {isEditing ? "Edit Product" : "Add New Product"}
      </h1>

      {error && (
        <div className="bg-red-500/10 text-red-400 text-sm rounded-lg px-4 py-2 mb-4">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-indigo-600/10 border border-indigo-500/30 rounded-xl p-4 space-y-2">
          <p className="text-indigo-300 text-sm font-medium">✨ AI Listing Generator</p>
          <p className="text-slate-400 text-xs">
            Type a rough title + category below, optionally list key features, then generate polished copy.
          </p>
          <input
            type="text"
            value={keyFeatures}
            onChange={(e) => setKeyFeatures(e.target.value)}
            placeholder="Key features (optional, e.g. waterproof, 20hr battery)"
            className="w-full rounded-lg bg-slate-700 text-white text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="button"
            onClick={generateCopy}
            disabled={generating}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm rounded-lg px-4 py-1.5 transition"
          >
            {generating ? "Generating..." : "Generate Title & Description"}
          </button>
        </div>

        <div>
          <label className="block text-sm text-slate-300 mb-1">Title</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => updateField("title", e.target.value)}
            required
            className="w-full rounded-lg bg-slate-700 text-white px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm text-slate-300 mb-1">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
            required
            rows={3}
            className="w-full rounded-lg bg-slate-700 text-white px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">Price (₹)</label>
            <input
              type="number"
              value={form.price}
              onChange={(e) => updateField("price", e.target.value)}
              required
              min="0"
              className="w-full rounded-lg bg-slate-700 text-white px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {benchmark && (
              <p className="text-slate-400 text-xs mt-1">
                Similar listings: ₹{benchmark.min} - ₹{benchmark.max} (avg ₹{benchmark.avg})
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Stock</label>
            <input
              type="number"
              value={form.stock}
              onChange={(e) => updateField("stock", e.target.value)}
              required
              min="0"
              className="w-full rounded-lg bg-slate-700 text-white px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">Category</label>
            <input
              type="text"
              value={form.category}
              onChange={(e) => updateField("category", e.target.value)}
              onBlur={fetchBenchmark}
              required
              className="w-full rounded-lg bg-slate-700 text-white px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Sub-category</label>
            <input
              type="text"
              value={form.subCategory}
              onChange={(e) => updateField("subCategory", e.target.value)}
              onBlur={fetchBenchmark}
              className="w-full rounded-lg bg-slate-700 text-white px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={autoTag}
          disabled={tagging}
          className="bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white text-sm rounded-lg px-4 py-1.5 transition"
        >
          {tagging ? "Tagging..." : "✨ Auto-tag category from title/description"}
        </button>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-lg py-2 transition"
        >
          {loading ? "Saving..." : isEditing ? "Save Changes" : "Create Listing"}
        </button>
      </form>
    </div>
  );
}

export default ProductForm;