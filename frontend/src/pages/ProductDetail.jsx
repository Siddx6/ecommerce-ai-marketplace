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

  if (loading) return <p className="text-muted p-6">Loading...</p>;
  if (!product) return <p className="text-muted p-6">Product not found.</p>;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="aspect-square bg-surface rounded flex items-center justify-center text-muted">
          {product.images?.[0] ? (
            <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover rounded" />
          ) : (
            "No image"
          )}
        </div>

        <div>
          <h1 className="font-display text-3xl font-bold text-cream">{product.title}</h1>
          <p className="text-muted text-xs uppercase tracking-wider font-semibold mt-2">
            {product.category} {product.subCategory && `/ ${product.subCategory}`}
          </p>
          {reviews.averageRating && (
            <p className="text-lime text-sm font-semibold mt-2">
              ★ {reviews.averageRating} ({reviews.count} review{reviews.count !== 1 ? "s" : ""})
            </p>
          )}

          <p className="font-mono text-coral text-4xl font-medium mt-5">₹{product.price}</p>
          <p className={`text-sm mt-2 font-semibold ${product.stock > 0 ? "text-lime" : "text-coral"}`}>
            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
          </p>

          <p className="text-cream mt-5 leading-relaxed">{product.description}</p>

          <p className="text-muted text-sm mt-5">
            Sold by {product.seller?.sellerProfile?.storeName || product.seller?.name}
          </p>

          {user ? (
            <div className="flex gap-3 mt-7">
              <button
                onClick={addToCart}
                disabled={product.stock === 0}
                className="bg-coral text-coral-dark font-display font-bold rounded px-6 py-3 hover:opacity-90 disabled:opacity-50 transition"
              >
                Add to Cart
              </button>
              <button
                onClick={addToWishlist}
                className="bg-surface text-cream border border-surface-light rounded px-6 py-3 hover:bg-surface-light transition font-medium"
              >
                Save for Later
              </button>
            </div>
          ) : (
            <p className="text-muted mt-7 text-sm">Log in to purchase or save this item.</p>
          )}

          {actionMessage && <p className="text-lime text-sm font-semibold mt-3">{actionMessage}</p>}
        </div>
      </div>

      {reviewSummary && (reviewSummary.pros?.length > 0 || reviewSummary.cons?.length > 0) && (
        <div className="bg-surface rounded p-6 border-t-[3px] border-lime">
          <span className="inline-block bg-lime text-lime-dark text-xs font-bold uppercase tracking-wider rounded px-2.5 py-1 mb-4">
            What customers say
          </span>
          <div className="grid md:grid-cols-2 gap-5 text-sm">
            {reviewSummary.pros?.length > 0 && (
              <div>
                <p className="text-lime font-semibold mb-2">Pros</p>
                <ul className="text-cream space-y-1.5">
                  {reviewSummary.pros.map((p, i) => <li key={i}>+ {p}</li>)}
                </ul>
              </div>
            )}
            {reviewSummary.cons?.length > 0 && (
              <div>
                <p className="text-coral font-semibold mb-2">Cons</p>
                <ul className="text-cream space-y-1.5">
                  {reviewSummary.cons.map((c, i) => <li key={i}>- {c}</li>)}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {user && (
        <div className="bg-surface rounded p-6">
          <h3 className="font-display font-bold text-cream mb-4">Write a Review</h3>

          {reviewSubmitted ? (
            <p className="text-lime text-sm font-semibold">Thanks for your review!</p>
          ) : (
            <form onSubmit={submitReview} className="space-y-4">
              {reviewError && (
                <div className="bg-coral/10 text-coral text-sm rounded px-4 py-2.5 font-medium">{reviewError}</div>
              )}

              <div className="flex items-center gap-1">
                <span className="text-sm text-muted font-medium mr-2">Rating:</span>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className={`text-2xl leading-none ${star <= reviewRating ? "text-lime" : "text-surface-light"}`}
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
                className="w-full rounded bg-ink border border-surface-light text-cream text-sm px-4 py-3 outline-none focus:border-coral transition"
              />

              <button
                type="submit"
                disabled={reviewSubmitting}
                className="bg-coral text-coral-dark font-display font-bold text-sm rounded px-5 py-2.5 hover:opacity-90 disabled:opacity-50 transition"
              >
                {reviewSubmitting ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          )}
        </div>
      )}

      {reviews.reviews.length > 0 && (
        <div>
          <h2 className="font-display font-bold text-cream mb-4">Reviews</h2>
          <div className="space-y-3">
            {reviews.reviews.map((r) => (
              <div key={r._id} className="bg-surface rounded p-5">
                <div className="flex justify-between text-sm">
                  <span className="text-cream font-semibold">{r.buyer?.name}</span>
                  <span className="text-lime font-semibold">★ {r.rating}</span>
                </div>
                {r.comment && <p className="text-muted text-sm mt-2">{r.comment}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {boughtTogether.length > 0 && (
        <div>
          <h2 className="font-display font-bold text-cream mb-4">Customers who bought this also bought</h2>
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