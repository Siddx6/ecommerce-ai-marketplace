import { useAuth } from "../context/AuthContext";
import BuyerDashboard from "./dashboards/BuyerDashboard";
import SellerDashboard from "./dashboards/SellerDashboard";
import AdminDashboard from "./dashboards/AdminDashboard";

function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
        <div>
          <h1 className="text-white font-semibold text-lg">Hi, {user.name}</h1>
          <span className="text-xs uppercase tracking-wide text-indigo-400">{user.role}</span>
        </div>
        <button
          onClick={logout}
          className="text-slate-300 hover:text-white text-sm bg-slate-800 hover:bg-slate-700 rounded-lg px-4 py-2 transition"
        >
          Log out
        </button>
      </header>

      <main className="p-6">
        {user.role === "buyer" && <BuyerDashboard />}
        {user.role === "seller" && <SellerDashboard />}
        {user.role === "admin" && <AdminDashboard />}
      </main>
    </div>
  );
}

export default Dashboard;