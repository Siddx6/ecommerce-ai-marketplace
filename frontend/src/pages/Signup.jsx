import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signup(name, email, password);
      navigate("/shop");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F3F6] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link
          to="/"
          className="font-display text-2xl font-bold text-[#1A1A22] block mb-8 text-center"
        >
          Shop<span className="text-[#FFA41C]">AI</span>
        </Link>

        <div className="bg-white rounded-xl border border-[#E4E4EA] shadow-sm p-8">
          <h1 className="font-display text-2xl font-bold text-[#1A1A22] mb-1">
            Get started
          </h1>
          <p className="text-[#6B6B76] text-sm mb-6">
            Create your ShopAI account
          </p>

          {error && (
            <div className="bg-[#FCEBEB] text-[#791F1F] text-sm rounded-md px-3 py-2 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-[#6B6B76] mb-1 block">
                Full name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full rounded-md border border-[#E4E4EA] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B3DF5] focus:border-transparent"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-[#6B6B76] mb-1 block">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full rounded-md border border-[#E4E4EA] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B3DF5] focus:border-transparent"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-[#6B6B76] mb-1 block">
                Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full rounded-md border border-[#E4E4EA] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B3DF5] focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#5B3DF5] hover:bg-[#4429D6] text-white font-semibold text-sm rounded-md py-2.5 transition disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="text-center text-sm text-[#6B6B76] mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-[#5B3DF5] font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;