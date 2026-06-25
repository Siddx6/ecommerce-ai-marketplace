import { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/client";
import { useAuth } from "../context/AuthContext";

function BecomeSeller() {
  const [storeName, setStoreName] = useState("");
  const [businessDescription, setBusinessDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  if (user?.role === "seller") {
    return (
      <div className="p-6 max-w-md mx-auto text-center space-y-3">
        <h1 className="font-display text-2xl font-bold text-cream">You're already a seller</h1>
        <p className="text-muted text-sm">
          {user.sellerProfile?.approved
            ? "Your store is approved and live."
            : "Your application is still awaiting admin approval."}
        </p>
      </div>
    );
  }

  if (user?.role === "admin") {
    return <p className="text-muted p-6 text-center">Admin accounts can't become sellers.</p>;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await apiClient.post("/auth/become-seller", { storeName, businessDescription });
      localStorage.setItem("token", res.data.token);
      await refreshUser();
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <span className="inline-block bg-lime text-lime-dark text-xs font-bold uppercase tracking-wider rounded px-2.5 py-1 mb-3">
        Seller onboarding
      </span>
      <h1 className="font-display text-3xl font-bold text-cream mb-2">Become a Seller</h1>
      <p className="text-muted text-sm mb-7">
        Register your store to start listing products. Your application will need admin approval before you can publish listings.
      </p>

      {error && (
        <div className="bg-coral/10 text-coral text-sm rounded px-4 py-2.5 mb-5 font-medium">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs uppercase tracking-wider font-semibold text-muted mb-2">
            Store Name
          </label>
          <input
            type="text"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            required
            className="w-full rounded bg-surface border border-surface-light text-cream px-4 py-3 outline-none focus:border-lime transition"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider font-semibold text-muted mb-2">
            Business Description (optional)
          </label>
          <textarea
            value={businessDescription}
            onChange={(e) => setBusinessDescription(e.target.value)}
            rows={3}
            className="w-full rounded bg-surface border border-surface-light text-cream px-4 py-3 outline-none focus:border-lime transition"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-lime text-lime-dark font-display font-bold rounded py-3.5 hover:opacity-90 disabled:opacity-50 transition"
        >
          {loading ? "Submitting..." : "Submit Application"}
        </button>
      </form>
    </div>
  );
}

export default BecomeSeller;