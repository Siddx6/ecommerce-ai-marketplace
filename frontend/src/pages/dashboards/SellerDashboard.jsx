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

  if (loading) return <p className="text-[#6B6B76]">Loading your dashboard...</p>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
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
            Units Sold
          </p>
          <p className="font-display text-2xl font-bold text-[#1A1A22]">
            {stats.totalUnitsSold}
          </p>
        </div>
        <div className="bg-white border border-[#E4E4EA] rounded-lg p-5">
          <p className="text-[#6B6B76] text-xs uppercase tracking-wide font-semibold mb-2">
            Total Revenue
          </p>
          <p className="font-display text-2xl font-bold text-[#5B3DF5]">
            ₹{stats.totalRevenue}
          </p>
        </div>
        <div className="bg-white border border-[#E4E4EA] rounded-lg p-5">
          <p className="text-[#6B6B76] text-xs uppercase tracking-wide font-semibold mb-2">
            Product Views
          </p>
          <p className="font-display text-2xl font-bold text-[#1A1A22]">
            {stats.totalViews}
          </p>
        </div>
        <div className="bg-white border border-[#E4E4EA] rounded-lg p-5">
          <p className="text-[#6B6B76] text-xs uppercase tracking-wide font-semibold mb-2">
            Conversion Rate
          </p>
          <p className="font-display text-2xl font-bold text-[#1D9E75]">
            {stats.conversionRate}%
          </p>
        </div>
      </div>

      {summary && (
        <div className="bg-white border border-[#E4E4EA] rounded-lg p-6 border-t-4 border-t-[#5B3DF5]">
          <span className="inline-block bg-[#EDEBFF] text-[#5B3DF5] text-xs font-bold uppercase tracking-wide rounded px-2.5 py-1 mb-3">
            AI insight
          </span>
          <p className="text-[#1A1A22] text-sm leading-relaxed">{summary}</p>
        </div>
      )}

      <div className="bg-white border border-[#E4E4EA] rounded-lg p-6">
        <h2 className="font-display font-bold text-[#1A1A22] mb-4">Top Products</h2>
        {stats.topProducts.length === 0 ? (
          <p className="text-[#6B6B76] text-sm">No sales yet.</p>
        ) : (
          <ul className="space-y-2.5">
            {stats.topProducts.map((p, i) => (
              <li key={i} className="text-sm flex justify-between">
                <span className="text-[#1A1A22]">
                  {p.title} ({p.unitsSold} sold)
                </span>
                <span className="text-[#5B3DF5] font-semibold">₹{p.revenue}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="bg-white border border-[#E4E4EA] rounded-lg p-6">
        <h2 className="font-display font-bold text-[#1A1A22] mb-4">
          Orders to Fulfill ({orders.length})
        </h2>
        {orders.length === 0 ? (
          <p className="text-[#6B6B76] text-sm">No orders yet.</p>
        ) : (
          <ul className="space-y-2.5">
            {orders.slice(0, 5).map((order) => (
              <li key={order._id} className="text-[#1A1A22] text-sm">
                {order.items
                  .map((item) => `${item.title} x${item.quantity} (${item.status})`)
                  .join(", ")}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default SellerDashboard;