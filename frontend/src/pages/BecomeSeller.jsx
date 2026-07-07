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
      <div className="bg-[#F3F3F6] min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md text-center space-y-3">
          <h1 className="font-display text-2xl font-bold text-[#1A1A22]">
            You're already a seller
          </h1>
          <p className="text-[#6B6B76] text-sm">
            {user.sellerProfile?.approved
              ? "Your store is approved and live."
              : "Your application is still awaiting admin approval."}
          </p>
        </div>
      </div>
    );
  }

  if (user?.role === "admin") {
    return (
      <p className="text-[#6B6B76] p-10 text-center bg-[#F3F3F6] min-h-screen">
        Admin accounts can't become sellers.
      </p>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await apiClient.post("/auth/become-seller", {
        storeName,
        businessDescription,
      });
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
    <div className="bg-[#F3F3F6] min-h-screen p-6">
      <div className="max-w-md mx-auto bg-white border border-[#E4E4EA] rounded-lg p-7">
        <span className="inline-block bg-[#EDEBFF] text-[#5B3DF5] text-xs font-bold uppercase tracking-wide rounded px-2.5 py-1 mb-3">
          Seller onboarding
        </span>
        <h1 className="font-display text-2xl font-bold text-[#1A1A22] mb-2">
          Become a Seller
        </h1>
        <p className="text-[#6B6B76] text-sm mb-7">
          Register your store to start listing products. Your application will
          need admin approval before you can publish listings.
        </p>

        {error && (
          <div className="bg-[#FCEBEB] text-[#791F1F] text-sm rounded-md px-4 py-2.5 mb-5 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs uppercase tracking-wide font-semibold text-[#6B6B76] mb-2">
              Store Name
            </label>
            <input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              required
              className="w-full rounded-md bg-white border border-[#E4E4EA] text-[#1A1A22] px-4 py-3 outline-none focus:border-[#5B3DF5] transition"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wide font-semibold text-[#6B6B76] mb-2">
              Business Description (optional)
            </label>
            <textarea
              value={businessDescription}
              onChange={(e) => setBusinessDescription(e.target.value)}
              rows={3}
              className="w-full rounded-md bg-white border border-[#E4E4EA] text-[#1A1A22] px-4 py-3 outline-none focus:border-[#5B3DF5] transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FFA41C] hover:bg-[#E68A00] text-[#14161C] font-display font-bold rounded-md py-3.5 disabled:opacity-50 transition"
          >
            {loading ? "Submitting..." : "Submit Application"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default BecomeSeller;