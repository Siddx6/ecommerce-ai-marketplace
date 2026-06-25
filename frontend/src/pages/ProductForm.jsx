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
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState([]);
  const [generatingFromImage, setGeneratingFromImage] = useState(false);

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
        setImages(p.images || []);
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

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await apiClient.post("/uploads", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setImages((prev) => [...prev, res.data.url]);
    } catch (err) {
      setError(err.response?.data?.message || "Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (url) => {
    setImages((prev) => prev.filter((img) => img !== url));
  };

  const generateCopyFromImage = async () => {
    if (images.length === 0) {
      setError("Upload a photo first, then generate from it");
      return;
    }
    setGeneratingFromImage(true);
    setError("");
    try {
      const res = await apiClient.post("/seller-tools/generate-copy-from-image", {
        imageUrl: images[0],
        category: form.category,
      });
      updateField("title", res.data.generated.title);
      updateField("description", res.data.generated.description);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to generate from image");
    } finally {
      setGeneratingFromImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = { ...form, price: Number(form.price), stock: Number(form.stock), images };
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

  if (loadingProduct) return <p className="text-muted p-6">Loading...</p>;

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="font-display text-2xl font-bold text-cream mb-6">
        {isEditing ? "Edit Product" : "Add New Product"}
      </h1>

      {error && (
        <div className="bg-coral/10 text-coral text-sm rounded px-4 py-2.5 mb-5 font-medium">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-surface rounded p-5 space-y-3 border-t-[3px] border-lime">
          <span className="inline-block bg-lime text-lime-dark text-xs font-bold uppercase tracking-wider rounded px-2.5 py-1">
            AI listing generator
          </span>
          <p className="text-muted text-xs">
            Type a rough title + category below, optionally list key features, then generate polished copy.
          </p>
          <input
            type="text"
            value={keyFeatures}
            onChange={(e) => setKeyFeatures(e.target.value)}
            placeholder="Key features (optional, e.g. waterproof, 20hr battery)"
            className="w-full rounded bg-ink border border-surface-light text-cream text-sm px-3 py-2.5 outline-none focus:border-lime transition"
          />
          <button
            type="button"
            onClick={generateCopy}
            disabled={generating}
            className="bg-lime text-lime-dark font-display font-bold text-sm rounded px-4 py-2 hover:opacity-90 disabled:opacity-50 transition"
          >
            {generating ? "Generating..." : "Generate Title & Description"}
          </button>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider font-semibold text-muted mb-2">Photos</label>
          <div className="flex flex-wrap gap-3 mb-3">
            {images.map((url) => (
              <div key={url} className="relative w-20 h-20 rounded overflow-hidden bg-surface">
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(url)}
                  className="absolute top-0 right-0 bg-coral text-coral-dark text-xs font-bold w-5 h-5 flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageUpload}
            disabled={uploading}
            className="text-sm text-muted"
          />
          {uploading && <p className="text-muted text-xs mt-1">Uploading...</p>}

          {images.length > 0 && (
            <button
              type="button"
              onClick={generateCopyFromImage}
              disabled={generatingFromImage}
              className="bg-lime text-lime-dark font-display font-bold text-sm rounded px-4 py-2 hover:opacity-90 disabled:opacity-50 transition mt-3"
            >
              {generatingFromImage ? "Looking at photo..." : "Generate Title & Description from Photo"}
            </button>
          )}
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider font-semibold text-muted mb-2">Title</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => updateField("title", e.target.value)}
            required
            className="w-full rounded bg-surface border border-surface-light text-cream px-4 py-3 outline-none focus:border-coral transition"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider font-semibold text-muted mb-2">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
            required
            rows={3}
            className="w-full rounded bg-surface border border-surface-light text-cream px-4 py-3 outline-none focus:border-coral transition"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-muted mb-2">Price (₹)</label>
            <input
              type="number"
              value={form.price}
              onChange={(e) => updateField("price", e.target.value)}
              required
              min="0"
              className="w-full rounded bg-surface border border-surface-light text-cream font-mono px-4 py-3 outline-none focus:border-coral transition"
            />
            {benchmark && (
              <p className="text-muted text-xs mt-2 font-mono">
                Similar: ₹{benchmark.min}–₹{benchmark.max} (avg ₹{benchmark.avg})
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-muted mb-2">Stock</label>
            <input
              type="number"
              value={form.stock}
              onChange={(e) => updateField("stock", e.target.value)}
              required
              min="0"
              className="w-full rounded bg-surface border border-surface-light text-cream font-mono px-4 py-3 outline-none focus:border-coral transition"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-muted mb-2">Category</label>
            <input
              type="text"
              value={form.category}
              onChange={(e) => updateField("category", e.target.value)}
              onBlur={fetchBenchmark}
              required
              className="w-full rounded bg-surface border border-surface-light text-cream px-4 py-3 outline-none focus:border-coral transition"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-muted mb-2">Sub-category</label>
            <input
              type="text"
              value={form.subCategory}
              onChange={(e) => updateField("subCategory", e.target.value)}
              onBlur={fetchBenchmark}
              className="w-full rounded bg-surface border border-surface-light text-cream px-4 py-3 outline-none focus:border-coral transition"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={autoTag}
          disabled={tagging}
          className="bg-surface border border-lime text-lime font-display font-bold text-sm rounded px-4 py-2 hover:bg-lime/10 disabled:opacity-50 transition"
        >
          {tagging ? "Tagging..." : "Auto-tag category from title/description"}
        </button>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-coral text-coral-dark font-display font-bold rounded py-3.5 hover:opacity-90 disabled:opacity-50 transition"
        >
          {loading ? "Saving..." : isEditing ? "Save Changes" : "Create Listing"}
        </button>
      </form>
    </div>
  );
}

export default ProductForm;