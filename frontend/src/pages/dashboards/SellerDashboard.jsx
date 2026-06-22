import { useState, useEffect } from "react";
import apiClient from "../../api/client";

function SellerDashboard() {
  const [stats, setStats] = useState(null);
  const [summary, setSummary] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiClient.get("/analytics/seller/summary"),
      apiClient.get("/orders/seller-orders"),
    ])
      .then(([analyticsRes, ordersRes]) => {
        setStats(analyticsRes.data.stats);
        setSummary(analyticsRes.data.summary);
        setOrders(ordersRes.data.orders);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-slate-400">Loading your dashboard...</p>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-slate-800 rounded-xl p-5">
          <p className="text-slate-400 text-sm">Total Orders</p>
          <p className="text-white text-2xl font-bold">{stats.totalOrders}</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-5">
          <p className="text-slate-400 text-sm">Units Sold</p>
          <p className="text-white text-2xl font-bold">{stats.totalUnitsSold}</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-5">
          <p className="text-slate-400 text-sm">Total Revenue</p>
          <p className="text-white text-2xl font-bold">₹{stats.totalRevenue}</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-5">
          <p className="text-slate-400 text-sm">Product Views</p>
          <p className="text-white text-2xl font-bold">{stats.totalViews}</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-5">
          <p className="text-slate-400 text-sm">Conversion Rate</p>
          <p className="text-white text-2xl font-bold">{stats.conversionRate}%</p>
        </div>
      </div>

      {summary && (
        <div className="bg-indigo-600/10 border border-indigo-500/30 rounded-xl p-5">
          <p className="text-indigo-300 text-sm font-medium mb-1">AI Insight</p>
          <p className="text-slate-200 text-sm">{summary}</p>
        </div>
      )}

      <div className="bg-slate-800 rounded-xl p-5">
        <h2 className="text-white font-semibold mb-3">Top Products</h2>
        {stats.topProducts.length === 0 ? (
          <p className="text-slate-400 text-sm">No sales yet.</p>
        ) : (
          <ul className="space-y-2">
            {stats.topProducts.map((p, i) => (
              <li key={i} className="text-slate-300 text-sm flex justify-between">
                <span>{p.title} ({p.unitsSold} sold)</span>
                <span className="text-slate-400">₹{p.revenue}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="bg-slate-800 rounded-xl p-5">
        <h2 className="text-white font-semibold mb-3">Orders to Fulfill ({orders.length})</h2>
        {orders.length === 0 ? (
          <p className="text-slate-400 text-sm">No orders yet.</p>
        ) : (
          <ul className="space-y-2">
            {orders.slice(0, 5).map((order) => (
              <li key={order._id} className="text-slate-300 text-sm">
                {order.items.map((item) => `${item.title} x${item.quantity} (${item.status})`).join(", ")}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default SellerDashboard;