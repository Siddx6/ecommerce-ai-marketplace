import { Navigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Landing() {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (user) return <Navigate to="/shop" replace />;

  return (
    <div className="min-h-screen bg-[#F3F3F6] flex flex-col">
      <header className="flex items-center justify-between px-8 py-6">
        <span className="font-display text-2xl font-bold text-[#1A1A22]">
          Shop<span className="text-[#FFA41C]">AI</span>
        </span>
        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="text-[#1A1A22] text-sm font-medium hover:text-[#5B3DF5] transition"
          >
            Log in
          </Link>
          <Link
            to="/signup"
            className="bg-[#5B3DF5] hover:bg-[#4429D6] text-white font-display font-bold text-sm rounded-md px-5 py-2.5 transition"
          >
            Sign up
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <span className="bg-[#EDEBFF] text-[#5B3DF5] font-sans font-bold text-xs uppercase tracking-wide rounded-full px-3 py-1.5 mb-6">
          ✦ AI native
        </span>
        <h1 className="font-display text-5xl md:text-6xl font-bold text-[#1A1A22] tracking-tight leading-tight max-w-3xl">
          Shopping, sharpened by AI.
        </h1>
        <p className="text-[#6B6B76] text-lg max-w-xl mt-6">
          Semantic search, smart recommendations, and a shopping assistant
          that actually understands what you're looking for.
        </p>

        <div className="flex gap-4 mt-10">
          <Link
            to="/signup"
            className="bg-[#FFA41C] hover:bg-[#E68A00] text-[#14161C] font-display font-bold text-base rounded-md px-8 py-3.5 transition"
          >
            Get started
          </Link>
          <Link
            to="/shop"
            className="border border-[#E4E4EA] bg-white text-[#1A1A22] font-display font-bold text-base rounded-md px-8 py-3.5 hover:bg-[#F3F3F6] transition"
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
          <div
            key={f.tag}
            className="bg-white border border-[#E4E4EA] rounded-lg p-6 border-t-4 border-t-[#5B3DF5]"
          >
            <span className="inline-block bg-[#EDEBFF] text-[#5B3DF5] font-sans font-bold text-xs uppercase tracking-wide rounded px-2.5 py-1 mb-3">
              {f.tag}
            </span>
            <p className="text-[#1A1A22] text-sm leading-relaxed">{f.text}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

export default Landing;