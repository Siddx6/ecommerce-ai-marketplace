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

  if (loading) return <p className="text-muted">Loading your dashboard...</p>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
        <div className="bg-surface rounded p-5">
          <p className="text-muted text-xs uppercase tracking-wider font-semibold mb-2">Total Orders</p>
          <p className="font-display text-2xl font-bold text-cream">{stats.totalOrders}</p>
        </div>
        <div className="bg-surface rounded p-5">
          <p className="text-muted text-xs uppercase tracking-wider font-semibold mb-2">Units Sold</p>
          <p className="font-display text-2xl font-bold text-cream">{stats.totalUnitsSold}</p>
        </div>
        <div className="bg-surface rounded p-5">
          <p className="text-muted text-xs uppercase tracking-wider font-semibold mb-2">Total Revenue</p>
          <p className="font-mono text-2xl font-medium text-coral">₹{stats.totalRevenue}</p>
        </div>
        <div className="bg-surface rounded p-5">
          <p className="text-muted text-xs uppercase tracking-wider font-semibold mb-2">Product Views</p>
          <p className="font-display text-2xl font-bold text-cream">{stats.totalViews}</p>
        </div>
        <div className="bg-surface rounded p-5">
          <p className="text-muted text-xs uppercase tracking-wider font-semibold mb-2">Conversion Rate</p>
          <p className="font-display text-2xl font-bold text-lime">{stats.conversionRate}%</p>
        </div>
      </div>

      {summary && (
        <div className="bg-surface rounded p-6 border-t-[3px] border-lime">
          <span className="inline-block bg-lime text-lime-dark text-xs font-bold uppercase tracking-wider rounded px-2.5 py-1 mb-3">
            AI insight
          </span>
          <p className="text-cream text-sm leading-relaxed">{summary}</p>
        </div>
      )}

      <div className="bg-surface rounded p-6">
        <h2 className="font-display font-bold text-cream mb-4">Top Products</h2>
        {stats.topProducts.length === 0 ? (
          <p className="text-muted text-sm">No sales yet.</p>
        ) : (
          <ul className="space-y-2.5">
            {stats.topProducts.map((p, i) => (
              <li key={i} className="text-sm flex justify-between">
                <span className="text-cream">{p.title} ({p.unitsSold} sold)</span>
                <span className="font-mono text-coral">₹{p.revenue}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="bg-surface rounded p-6">
        <h2 className="font-display font-bold text-cream mb-4">Orders to Fulfill ({orders.length})</h2>
        {orders.length === 0 ? (
          <p className="text-muted text-sm">No orders yet.</p>
        ) : (
          <ul className="space-y-2.5">
            {orders.slice(0, 5).map((order) => (
              <li key={order._id} className="text-cream text-sm">
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