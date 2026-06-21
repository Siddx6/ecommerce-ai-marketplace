import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import apiClient from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import ProductCard from "../components/ProductCard";

function ProductDetail() {
  const { productId } = useParams();
  const { user } = useAuth();
  const { refreshCart } = useCart();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState({ count: 0, averageRating: null, reviews: [] });
  const [reviewSummary, setReviewSummary] = useState(null);
  const [boughtTogether, setBoughtTogether] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState("");

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    Promise.all([
      apiClient.get(`/products/${productId}`),
      apiClient.get(`/reviews/product/${productId}`),
      apiClient.get(`/reviews/product/${productId}/summary`),
      apiClient.get(`/recommendations/bought-together/${productId}`),
    ])
      .then(([productRes, reviewsRes, summaryRes, boughtRes]) => {
        setProduct(productRes.data.product);
        setReviews(reviewsRes.data);
        setReviewSummary(summaryRes.data);
        setBoughtTogether(boughtRes.data.products);
      })
      .finally(() => setLoading(false));
  }, [productId]);

  const addToCart = async () => {
    await apiClient.post("/cart", { productId, quantity: 1 });
    await refreshCart();
    setActionMessage("Added to cart!");
    setTimeout(() => setActionMessage(""), 2000);
  };

  const addToWishlist = async () => {
    await apiClient.post("/wishlist", { productId });
    setActionMessage("Added to wishlist!");
    setTimeout(() => setActionMessage(""), 2000);
  };

  const submitReview = async (e) => {
    e.preventDefault();
    setReviewError("");
    setReviewSubmitting(true);

    try {
      await apiClient.post("/reviews", { productId, rating: reviewRating, comment: reviewComment });
      setReviewSubmitted(true);
      setReviewComment("");
      const [reviewsRes, summaryRes] = await Promise.all([
        apiClient.get(`/reviews/product/${productId}`),
        apiClient.get(`/reviews/product/${productId}/summary`),
      ]);
      setReviews(reviewsRes.data);
      setReviewSummary(summaryRes.data);
    } catch (err) {
      setReviewError(err.response?.data?.message || "Failed to submit review");
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) return <p className="text-slate-400 p-6">Loading...</p>;
  if (!product) return <p className="text-slate-400 p-6">Product not found.</p>;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="aspect-square bg-slate-800 rounded-xl flex items-center justify-center text-slate-500">
          {product.images?.[0] ? (
            <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover rounded-xl" />
          ) : (
            "No image"
          )}
        </div>

        <div>
          <h1 className="text-2xl font-bold text-white">{product.title}</h1>
          <p className="text-slate-400 text-sm mt-1">
            {product.category} {product.subCategory && `• ${product.subCategory}`}
          </p>
          {reviews.averageRating && (
            <p className="text-yellow-400 text-sm mt-1">
              ★ {reviews.averageRating} ({reviews.count} review{reviews.count !== 1 ? "s" : ""})
            </p>
          )}

          <p className="text-white text-3xl font-bold mt-4">₹{product.price}</p>
          <p className={`text-sm mt-1 ${product.stock > 0 ? "text-green-400" : "text-red-400"}`}>
            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
          </p>

          <p className="text-slate-300 mt-4">{product.description}</p>

          <p className="text-slate-500 text-sm mt-4">
            Sold by {product.seller?.sellerProfile?.storeName || product.seller?.name}
          </p>

          {user ? (
            <div className="flex gap-3 mt-6">
              <button
                onClick={addToCart}
                disabled={product.stock === 0}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-lg px-6 py-2 transition"
              >
                Add to Cart
              </button>
              <button
                onClick={addToWishlist}
                className="bg-slate-700 hover:bg-slate-600 text-white rounded-lg px-6 py-2 transition"
              >
                Save for Later
              </button>
            </div>
          ) : (
            <p className="text-slate-400 mt-6 text-sm">Log in to purchase or save this item.</p>
          )}

          {actionMessage && <p className="text-green-400 text-sm mt-3">{actionMessage}</p>}
        </div>
      </div>

      {reviewSummary && (reviewSummary.pros?.length > 0 || reviewSummary.cons?.length > 0) && (
        <div className="bg-indigo-600/10 border border-indigo-500/30 rounded-xl p-5">
          <p className="text-indigo-300 text-sm font-medium mb-2">What customers say</p>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            {reviewSummary.pros?.length > 0 && (
              <div>
                <p className="text-green-400 mb-1">Pros</p>
                <ul className="text-slate-300 space-y-1">
                  {reviewSummary.pros.map((p, i) => <li key={i}>+ {p}</li>)}
                </ul>
              </div>
            )}
            {reviewSummary.cons?.length > 0 && (
              <div>
                <p className="text-red-400 mb-1">Cons</p>
                <ul className="text-slate-300 space-y-1">
                  {reviewSummary.cons.map((c, i) => <li key={i}>- {c}</li>)}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {user && (
        <div className="bg-slate-800 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-3">Write a Review</h3>

          {reviewSubmitted ? (
            <p className="text-green-400 text-sm">Thanks for your review!</p>
          ) : (
            <form onSubmit={submitReview} className="space-y-3">
              {reviewError && (
                <div className="bg-red-500/10 text-red-400 text-sm rounded-lg px-3 py-2">{reviewError}</div>
              )}

              <div className="flex items-center gap-1">
                <span className="text-sm text-slate-300 mr-2">Rating:</span>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className={`text-2xl leading-none ${star <= reviewRating ? "text-yellow-400" : "text-slate-600"}`}
                  >
                    ★
                  </button>
                ))}
              </div>

              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Share your thoughts about this product (optional)..."
                rows={3}
                className="w-full rounded-lg bg-slate-700 text-white text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
              />

              <button
                type="submit"
                disabled={reviewSubmitting}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold rounded-lg px-4 py-2 transition"
              >
                {reviewSubmitting ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          )}
        </div>
      )}

      {reviews.reviews.length > 0 && (
        <div>
          <h2 className="text-white font-semibold mb-3">Reviews</h2>
          <div className="space-y-3">
            {reviews.reviews.map((r) => (
              <div key={r._id} className="bg-slate-800 rounded-xl p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-white font-medium">{r.buyer?.name}</span>
                  <span className="text-yellow-400">★ {r.rating}</span>
                </div>
                {r.comment && <p className="text-slate-300 text-sm mt-1">{r.comment}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {boughtTogether.length > 0 && (
        <div>
          <h2 className="text-white font-semibold mb-3">Customers who bought this also bought</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {boughtTogether.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductDetail;