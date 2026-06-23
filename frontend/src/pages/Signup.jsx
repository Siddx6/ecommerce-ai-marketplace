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
    <div className="min-h-screen bg-ink flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link to="/" className="font-display text-2xl font-bold text-cream block mb-10">
          ShopAI
        </Link>

        <div className="bg-surface rounded p-10 border-l-4 border-lime">
          <h1 className="font-display text-3xl font-bold text-cream mb-1">Get started.</h1>
          <p className="text-muted text-sm mb-7">Create your ShopAI account</p>

          {error && (
            <div className="bg-coral/10 text-coral text-sm rounded px-4 py-2.5 mb-5 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-muted mb-2">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded bg-ink border border-surface-light text-cream px-4 py-3 outline-none focus:border-lime transition"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-muted mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded bg-ink border border-surface-light text-cream px-4 py-3 outline-none focus:border-lime transition"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-muted mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded bg-ink border border-surface-light text-cream px-4 py-3 outline-none focus:border-lime transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-lime text-lime-dark font-display font-bold text-base rounded py-3.5 hover:opacity-90 disabled:opacity-50 transition"
            >
              {loading ? "Creating account..." : "Sign up"}
            </button>
          </form>
        </div>

        <p className="text-muted text-sm mt-6 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-lime font-semibold hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;