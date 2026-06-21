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
        <h1 className="text-xl font-bold text-white">You're already a seller</h1>
        <p className="text-slate-400 text-sm">
          {user.sellerProfile?.approved
            ? "Your store is approved and live."
            : "Your application is still awaiting admin approval."}
        </p>
      </div>
    );
  }

  if (user?.role === "admin") {
    return <p className="text-slate-400 p-6 text-center">Admin accounts can't become sellers.</p>;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await apiClient.post("/auth/become-seller", { storeName, businessDescription });
      // eslint-disable-next-line no-undef
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
      <h1 className="text-xl font-bold text-white mb-2">Become a Seller</h1>
      <p className="text-slate-400 text-sm mb-6">
        Register your store to start listing products. Your application will need admin approval before you can publish listings.
      </p>

      {error && (
        <div className="bg-red-500/10 text-red-400 text-sm rounded-lg px-4 py-2 mb-4">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-slate-300 mb-1">Store Name</label>
          <input
            type="text"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            required
            className="w-full rounded-lg bg-slate-700 text-white px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm text-slate-300 mb-1">Business Description (optional)</label>
          <textarea
            value={businessDescription}
            onChange={(e) => setBusinessDescription(e.target.value)}
            rows={3}
            className="w-full rounded-lg bg-slate-700 text-white px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-lg py-2 transition"
        >
          {loading ? "Submitting..." : "Submit Application"}
        </button>
      </form>
    </div>
  );
}

export default BecomeSeller;