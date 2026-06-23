import { Navigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Landing() {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (user) return <Navigate to="/shop" replace />;

  return (
    <div className="min-h-screen bg-ink flex flex-col">
      <header className="flex items-center justify-between px-8 py-6">
        <div className="flex items-baseline gap-3">
          <span className="font-display text-2xl font-bold text-cream">ShopAI</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-cream text-sm font-medium hover:text-coral transition">
            Log in
          </Link>
          <Link
            to="/signup"
            className="bg-coral text-coral-dark font-display font-bold text-sm rounded px-5 py-2.5 hover:opacity-90 transition"
          >
            Sign up
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <span className="bg-lime text-lime-dark font-sans font-bold text-xs uppercase tracking-wider rounded px-3 py-1.5 mb-6">
          AI native
        </span>
        <h1 className="font-display text-6xl md:text-7xl font-bold text-cream tracking-tight leading-none max-w-3xl">
          Shopping, sharpened by AI.
        </h1>
        <p className="text-muted text-lg max-w-xl mt-6">
          Semantic search, smart recommendations, and a shopping assistant that actually
          understands what you're looking for.
        </p>

        <div className="flex gap-4 mt-10">
          <Link
            to="/signup"
            className="bg-coral text-coral-dark font-display font-bold text-base rounded px-8 py-3.5 hover:opacity-90 transition"
          >
            Get started
          </Link>
          <Link
            to="/shop"
            className="border border-surface-light text-cream font-display font-bold text-base rounded px-8 py-3.5 hover:bg-surface transition"
          >
            Browse as guest
          </Link>
        </div>
      </main>

      <section className="px-8 py-12 grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto w-full">
        {[
          { tag: "AI search", text: "Describe what you want in plain language — we'll find it." },
          { tag: "AI assistant", text: "Ask questions, compare products, get real recommendations." },
          { tag: "AI for sellers", text: "Generate listings from a photo. Auto-tagged, benchmarked." },
        ].map((f) => (
          <div key={f.tag} className="bg-surface rounded p-6 border-t-[3px] border-lime">
            <span className="inline-block bg-lime text-lime-dark font-sans font-bold text-xs uppercase tracking-wider rounded px-2.5 py-1 mb-3">
              {f.tag}
            </span>
            <p className="text-cream text-sm leading-relaxed">{f.text}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

export default Landing;