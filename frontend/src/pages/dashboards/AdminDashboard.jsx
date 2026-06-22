import { useState, useEffect } from "react";
import apiClient from "../../api/client";

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [summary, setSummary] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiClient.get("/analytics/admin/summary"),
      apiClient.get("/admin/users"),
    ])
      .then(([analyticsRes, usersRes]) => {
        setStats(analyticsRes.data.stats);
        setSummary(analyticsRes.data.summary);
        setUsers(usersRes.data.users);
      })
      .finally(() => setLoading(false));
  }, []);

  const approveSeller = async (userId) => {
    await apiClient.patch(`/admin/users/${userId}/approve-seller`);
    const res = await apiClient.get("/admin/users");
    setUsers(res.data.users);
  };

  if (loading) return <p className="text-slate-400">Loading platform data...</p>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-800 rounded-xl p-5">
          <p className="text-slate-400 text-sm">Buyers</p>
          <p className="text-white text-2xl font-bold">{stats.users.totalBuyers}</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-5">
          <p className="text-slate-400 text-sm">Sellers</p>
          <p className="text-white text-2xl font-bold">{stats.users.totalSellers}</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-5">
          <p className="text-slate-400 text-sm">Total Orders</p>
          <p className="text-white text-2xl font-bold">{stats.totalOrders}</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-5">
          <p className="text-slate-400 text-sm">Platform GMV</p>
          <p className="text-white text-2xl font-bold">₹{stats.totalGMV}</p>
        </div>
      </div>

      {stats.gmvTrend && stats.gmvTrend.length > 0 && (
        <div className="bg-slate-800 rounded-xl p-5">
          <h2 className="text-white font-semibold mb-3">GMV Trend</h2>
          <div className="space-y-1">
            {stats.gmvTrend.map((d) => (
              <div key={d.date} className="flex justify-between text-sm text-slate-300">
                <span>{d.date}</span>
                <span>₹{d.gmv}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {summary && (
        <div className="bg-indigo-600/10 border border-indigo-500/30 rounded-xl p-5">
          <p className="text-indigo-300 text-sm font-medium mb-1">AI Insight</p>
          <p className="text-slate-200 text-sm">{summary}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-800 rounded-xl p-5">
          <h2 className="text-white font-semibold mb-3">Top Categories</h2>
          <ul className="space-y-2">
            {stats.topCategories.map((c, i) => (
              <li key={i} className="text-slate-300 text-sm flex justify-between">
                <span>{c.category}</span>
                <span className="text-slate-400">₹{c.revenue}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-slate-800 rounded-xl p-5">
          <h2 className="text-white font-semibold mb-3">Top Sellers</h2>
          <ul className="space-y-2">
            {stats.topSellers.map((s) => (
              <li key={s.sellerId} className="text-slate-300 text-sm flex justify-between">
                <span>{s.storeName}</span>
                <span className="text-slate-400">₹{s.revenue}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl p-5">
        <h2 className="text-white font-semibold mb-3">All Users ({users.length})</h2>
        <ul className="space-y-2">
          {users.map((u) => (
            <li key={u._id} className="text-slate-300 text-sm flex items-center justify-between">
              <span>
                {u.name} <span className="text-slate-500">({u.role})</span>
              </span>
              {u.role === "seller" && !u.sellerProfile?.approved && (
                <button
                  onClick={() => approveSeller(u._id)}
                  className="bg-green-600 hover:bg-green-500 text-white text-xs rounded-lg px-3 py-1 transition"
                >
                  Approve Seller
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default AdminDashboard;