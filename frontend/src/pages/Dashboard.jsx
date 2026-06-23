import { useAuth } from "../context/AuthContext";
import BuyerDashboard from "./dashboards/BuyerDashboard";
import SellerDashboard from "./dashboards/SellerDashboard";
import AdminDashboard from "./dashboards/AdminDashboard";

function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-ink">
      <header className="flex items-center justify-between px-8 py-6 border-b border-surface-light">
        <div>
          <h1 className="font-display font-bold text-2xl text-cream">Hi, {user.name}</h1>
          <span className="inline-block mt-1 bg-lime text-lime-dark text-xs font-bold uppercase tracking-wider rounded px-2 py-0.5">
            {user.role}
          </span>
        </div>
        <button
          onClick={logout}
          className="text-cream text-sm font-medium bg-surface hover:bg-surface-light border border-surface-light rounded px-4 py-2 transition"
        >
          Log out
        </button>
      </header>

      <main className="p-8">
        {user.role === "buyer" && <BuyerDashboard />}
        {user.role === "seller" && <SellerDashboard />}
        {user.role === "admin" && <AdminDashboard />}
      </main>
    </div>
  );
}

export default Dashboard;