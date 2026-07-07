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

  if (loading) return <p className="text-[#6B6B76] p-6">Loading...</p>;
  if (!product) return <p className="text-[#6B6B76] p-6">Product not found.</p>;

  return (
    <div className="bg-[#F3F3F6] min-h-screen">
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <div className="grid md:grid-cols-2 gap-8 bg-white border border-[#E4E4EA] rounded-lg p-6">
          <div className="aspect-square bg-[#F5F4FA] rounded-lg flex items-center justify-center text-[#6B6B76]">
            {product.images?.[0] ? (
              <img
                src={product.images[0]}
                alt={product.title}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              "No image"
            )}
          </div>

          <div>
            <h1 className="font-display text-2xl font-bold text-[#1A1A22]">
              {product.title}
            </h1>
            <p className="text-[#6B6B76] text-xs uppercase tracking-wide font-semibold mt-2">
              {product.category} {product.subCategory && `/ ${product.subCategory}`}
            </p>
            {reviews.averageRating && (
              <p className="text-sm font-semibold mt-2">
                <span className="bg-[#1D9E75] text-white px-1.5 py-0.5 rounded text-xs mr-1">
                  {reviews.averageRating}★
                </span>
                <span className="text-[#6B6B76]">
                  {reviews.count} review{reviews.count !== 1 ? "s" : ""}
                </span>
              </p>
            )}

            <p className="text-[#1A1A22] text-3xl font-bold mt-5">₹{product.price}</p>
            <p
              className={`text-sm mt-2 font-semibold ${
                product.stock > 0 ? "text-[#1D9E75]" : "text-[#C0392B]"
              }`}
            >
              {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
            </p>

            <p className="text-[#1A1A22] mt-5 leading-relaxed text-sm">
              {product.description}
            </p>

            <p className="text-[#6B6B76] text-sm mt-5">
              Sold by{" "}
              {product.seller?.sellerProfile?.storeName || product.seller?.name}
            </p>

            {user ? (
              <div className="flex gap-3 mt-6">
                <button
                  onClick={addToCart}
                  disabled={product.stock === 0}
                  className="bg-[#5B3DF5] hover:bg-[#4429D6] text-white font-semibold rounded-md px-6 py-2.5 text-sm disabled:opacity-50 transition"
                >
                  Add to Cart
                </button>
                <button
                  onClick={addToWishlist}
                  className="bg-white text-[#1A1A22] border border-[#E4E4EA] rounded-md px-6 py-2.5 text-sm font-medium hover:bg-[#F3F3F6] transition"
                >
                  Save for Later
                </button>
              </div>
            ) : (
              <p className="text-[#6B6B76] mt-6 text-sm">
                Log in to purchase or save this item.
              </p>
            )}

            {actionMessage && (
              <p className="text-[#1D9E75] text-sm font-semibold mt-3">
                {actionMessage}
              </p>
            )}
          </div>
        </div>

        {reviewSummary && (reviewSummary.pros?.length > 0 || reviewSummary.cons?.length > 0) && (
          <div className="bg-white border border-[#E4E4EA] rounded-lg p-6 border-t-4 border-t-[#5B3DF5]">
            <span className="inline-block bg-[#EDEBFF] text-[#5B3DF5] text-xs font-bold uppercase tracking-wide rounded px-2.5 py-1 mb-4">
              AI Summary — What customers say
            </span>
            <div className="grid md:grid-cols-2 gap-5 text-sm">
              {reviewSummary.pros?.length > 0 && (
                <div>
                  <p className="text-[#1D9E75] font-semibold mb-2">Pros</p>
                  <ul className="text-[#1A1A22] space-y-1.5">
                    {reviewSummary.pros.map((p, i) => (
                      <li key={i}>+ {p}</li>
                    ))}
                  </ul>
                </div>
              )}
              {reviewSummary.cons?.length > 0 && (
                <div>
                  <p className="text-[#C0392B] font-semibold mb-2">Cons</p>
                  <ul className="text-[#1A1A22] space-y-1.5">
                    {reviewSummary.cons.map((c, i) => (
                      <li key={i}>- {c}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {user && (
          <div className="bg-white border border-[#E4E4EA] rounded-lg p-6">
            <h3 className="font-display font-bold text-[#1A1A22] mb-4">
              Write a Review
            </h3>

            {reviewSubmitted ? (
              <p className="text-[#1D9E75] text-sm font-semibold">
                Thanks for your review!
              </p>
            ) : (
              <form onSubmit={submitReview} className="space-y-4">
                {reviewError && (
                  <div className="bg-[#FCEBEB] text-[#791F1F] text-sm rounded-md px-4 py-2.5 font-medium">
                    {reviewError}
                  </div>
                )}

                <div className="flex items-center gap-1">
                  <span className="text-sm text-[#6B6B76] font-medium mr-2">
                    Rating:
                  </span>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className={`text-2xl leading-none ${
                        star <= reviewRating ? "text-[#FFA41C]" : "text-[#E4E4EA]"
                      }`}
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
                  className="w-full rounded-md bg-white border border-[#E4E4EA] text-[#1A1A22] text-sm px-4 py-3 outline-none focus:border-[#5B3DF5] transition"
                />

                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  className="bg-[#5B3DF5] hover:bg-[#4429D6] text-white font-semibold text-sm rounded-md px-5 py-2.5 disabled:opacity-50 transition"
                >
                  {reviewSubmitting ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            )}
          </div>
        )}

        {reviews.reviews.length > 0 && (
          <div>
            <h2 className="font-display font-bold text-[#1A1A22] mb-4">Reviews</h2>
            <div className="space-y-3">
              {reviews.reviews.map((r) => (
                <div
                  key={r._id}
                  className="bg-white border border-[#E4E4EA] rounded-lg p-5"
                >
                  <div className="flex justify-between text-sm">
                    <span className="text-[#1A1A22] font-semibold">
                      {r.buyer?.name}
                    </span>
                    <span className="text-[#FFA41C] font-semibold">
                      ★ {r.rating}
                    </span>
                  </div>
                  {r.comment && (
                    <p className="text-[#6B6B76] text-sm mt-2">{r.comment}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {boughtTogether.length > 0 && (
          <div>
            <h2 className="font-display font-bold text-[#1A1A22] mb-4">
              Customers who bought this also bought
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {boughtTogether.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductDetail;