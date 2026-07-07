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

  if (loading) return <p className="text-[#6B6B76]">Loading platform data...</p>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-6 gap-5">
        <div className="bg-white border border-[#E4E4EA] rounded-lg p-5">
          <p className="text-[#6B6B76] text-xs uppercase tracking-wide font-semibold mb-2">
            Buyers
          </p>
          <p className="font-display text-2xl font-bold text-[#1A1A22]">
            {stats.users.totalBuyers}
          </p>
        </div>
        <div className="bg-white border border-[#E4E4EA] rounded-lg p-5">
          <p className="text-[#6B6B76] text-xs uppercase tracking-wide font-semibold mb-2">
            Sellers
          </p>
          <p className="font-display text-2xl font-bold text-[#1A1A22]">
            {stats.users.totalSellers}
          </p>
        </div>
        <div className="bg-white border border-[#E4E4EA] rounded-lg p-5">
          <p className="text-[#6B6B76] text-xs uppercase tracking-wide font-semibold mb-2">
            Total Orders
          </p>
          <p className="font-display text-2xl font-bold text-[#1A1A22]">
            {stats.totalOrders}
          </p>
        </div>
        <div className="bg-white border border-[#E4E4EA] rounded-lg p-5">
          <p className="text-[#6B6B76] text-xs uppercase tracking-wide font-semibold mb-2">
            Platform GMV
          </p>
          <p className="font-display text-2xl font-bold text-[#5B3DF5]">
            ₹{stats.totalGMV}
          </p>
        </div>
        <div className="bg-white border border-[#E4E4EA] rounded-lg p-5">
          <p className="text-[#6B6B76] text-xs uppercase tracking-wide font-semibold mb-2">
            Total Views
          </p>
          <p className="font-display text-2xl font-bold text-[#1A1A22]">
            {stats.totalPlatformViews}
          </p>
        </div>
        <div className="bg-white border border-[#E4E4EA] rounded-lg p-5">
          <p className="text-[#6B6B76] text-xs uppercase tracking-wide font-semibold mb-2">
            Conversion Rate
          </p>
          <p className="font-display text-2xl font-bold text-[#1D9E75]">
            {stats.platformConversionRate}%
          </p>
        </div>
      </div>

      {stats.gmvTrend && stats.gmvTrend.length > 0 && (
        <div className="bg-white border border-[#E4E4EA] rounded-lg p-6">
          <h2 className="font-display font-bold text-[#1A1A22] mb-4">GMV Trend</h2>
          <div className="space-y-2">
            {stats.gmvTrend.map((d) => (
              <div key={d.date} className="flex justify-between text-sm">
                <span className="text-[#6B6B76]">{d.date}</span>
                <span className="text-[#5B3DF5] font-semibold">₹{d.gmv}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {summary && (
        <div className="bg-white border border-[#E4E4EA] rounded-lg p-6 border-t-4 border-t-[#5B3DF5]">
          <span className="inline-block bg-[#EDEBFF] text-[#5B3DF5] text-xs font-bold uppercase tracking-wide rounded px-2.5 py-1 mb-3">
            AI insight
          </span>
          <p className="text-[#1A1A22] text-sm leading-relaxed">{summary}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-[#E4E4EA] rounded-lg p-6">
          <h2 className="font-display font-bold text-[#1A1A22] mb-4">Top Categories</h2>
          <ul className="space-y-2.5">
            {stats.topCategories.map((c, i) => (
              <li key={i} className="text-sm flex justify-between">
                <span className="text-[#1A1A22]">{c.category}</span>
                <span className="text-[#5B3DF5] font-semibold">₹{c.revenue}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white border border-[#E4E4EA] rounded-lg p-6">
          <h2 className="font-display font-bold text-[#1A1A22] mb-4">Top Sellers</h2>
          <ul className="space-y-2.5">
            {stats.topSellers.map((s) => (
              <li key={s.sellerId} className="text-sm flex justify-between">
                <span className="text-[#1A1A22]">{s.storeName}</span>
                <span className="text-[#5B3DF5] font-semibold">₹{s.revenue}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-white border border-[#E4E4EA] rounded-lg p-6">
        <h2 className="font-display font-bold text-[#1A1A22] mb-4">
          All Users ({users.length})
        </h2>
        <ul className="space-y-3">
          {users.map((u) => (
            <li key={u._id} className="text-sm flex items-center justify-between">
              <span className="text-[#1A1A22]">
                {u.name} <span className="text-[#6B6B76]">({u.role})</span>
              </span>
              {u.role === "seller" && !u.sellerProfile?.approved && (
                <button
                  onClick={() => approveSeller(u._id)}
                  className="bg-[#1D9E75] text-white text-xs font-bold rounded-md px-3 py-1.5 hover:opacity-90 transition"
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