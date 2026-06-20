import { useState, useEffect } from "react";
import apiClient from "../../api/client";

function BuyerDashboard() {
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [segment, setSegment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiClient.get("/orders/my-orders"),
      apiClient.get("/wishlist"),
      apiClient.get("/notifications"),
      apiClient.get("/insights/my-segment"),
    ])
      .then(([ordersRes, wishlistRes, notifRes, segmentRes]) => {
        setOrders(ordersRes.data.orders);
        setWishlist(wishlistRes.data.wishlist.items || []);
        setNotifications(notifRes.data.notifications);
        setSegment(segmentRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-slate-400">Loading your dashboard...</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="bg-slate-800 rounded-xl p-5">
        <h2 className="text-white font-semibold mb-3">Your Orders ({orders.length})</h2>
        {orders.length === 0 ? (
          <p className="text-slate-400 text-sm">No orders yet.</p>
        ) : (
          <ul className="space-y-2">
            {orders.slice(0, 5).map((order) => (
              <li key={order._id} className="text-slate-300 text-sm flex justify-between">
                <span>{order.items.length} item(s)</span>
                <span className="text-slate-400">₹{order.totalAmount}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="bg-slate-800 rounded-xl p-5">
        <h2 className="text-white font-semibold mb-3">Wishlist ({wishlist.length})</h2>
        {wishlist.length === 0 ? (
          <p className="text-slate-400 text-sm">Nothing saved yet.</p>
        ) : (
          <ul className="space-y-2">
            {wishlist.map((item) => (
              <li key={item._id} className="text-slate-300 text-sm">
                {item.product?.title} — ₹{item.product?.price}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="bg-slate-800 rounded-xl p-5">
        <h2 className="text-white font-semibold mb-3">
          Notifications{" "}
          {notifications.filter((n) => !n.isRead).length > 0 && (
            <span className="bg-indigo-600 text-xs rounded-full px-2 py-0.5 ml-1">
              {notifications.filter((n) => !n.isRead).length} new
            </span>
          )}
        </h2>
        {notifications.length === 0 ? (
          <p className="text-slate-400 text-sm">No notifications.</p>
        ) : (
          <ul className="space-y-2">
            {notifications.slice(0, 5).map((n) => (
              <li key={n._id} className="text-slate-300 text-sm">
                {n.message}
              </li>
            ))}
          </ul>
        )}
      </div>

      {segment && (
        <div className="bg-slate-800 rounded-xl p-5 md:col-span-2 lg:col-span-3">
          <h2 className="text-white font-semibold mb-3">Your Profile</h2>
          <div className="flex flex-wrap gap-2 mb-2">
            {segment.segments.map((tag) => (
              <span key={tag} className="bg-indigo-600/20 text-indigo-300 text-xs rounded-full px-3 py-1">
                {tag.replace(/_/g, " ")}
              </span>
            ))}
          </div>
          <p className="text-slate-400 text-sm">
            {segment.stats.totalOrders} orders • ₹{segment.stats.totalSpend} total spend
          </p>
        </div>
      )}
    </div>
  );
}

export default BuyerDashboard;