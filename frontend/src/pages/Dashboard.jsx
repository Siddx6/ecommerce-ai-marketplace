import { useAuth } from "../context/AuthContext";
import BuyerDashboard from "./dashboards/BuyerDashboard";
import SellerDashboard from "./dashboards/SellerDashboard";
import AdminDashboard from "./dashboards/AdminDashboard";

function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#F3F3F6]">
      <header className="flex items-center justify-between px-8 py-6 bg-white border-b border-[#E4E4EA]">
        <div>
          <h1 className="font-display font-bold text-2xl text-[#1A1A22]">
            Hi, {user.name}
          </h1>
          <span className="inline-block mt-1 bg-[#EDEBFF] text-[#5B3DF5] text-xs font-bold uppercase tracking-wide rounded px-2 py-0.5">
            {user.role}
          </span>
        </div>
        <button
          onClick={logout}
          className="text-[#1A1A22] text-sm font-medium bg-white hover:bg-[#F3F3F6] border border-[#E4E4EA] rounded-md px-4 py-2 transition"
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