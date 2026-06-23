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

  if (loading) return <p className="text-muted">Loading your dashboard...</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="bg-surface rounded p-6">
        <h2 className="font-display font-bold text-cream mb-4">Your Orders ({orders.length})</h2>
        {orders.length === 0 ? (
          <p className="text-muted text-sm">No orders yet.</p>
        ) : (
          <ul className="space-y-2.5">
            {orders.slice(0, 5).map((order) => (
              <li key={order._id} className="text-sm flex justify-between">
                <span className="text-cream">{order.items.length} item(s)</span>
                <span className="font-mono text-coral">₹{order.totalAmount}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="bg-surface rounded p-6">
        <h2 className="font-display font-bold text-cream mb-4">Wishlist ({wishlist.length})</h2>
        {wishlist.length === 0 ? (
          <p className="text-muted text-sm">Nothing saved yet.</p>
        ) : (
          <ul className="space-y-2.5">
            {wishlist.map((item) => (
              <li key={item._id} className="text-sm text-cream">
                {item.product?.title} — <span className="font-mono text-coral">₹{item.product?.price}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="bg-surface rounded p-6">
        <h2 className="font-display font-bold text-cream mb-4 flex items-center gap-2">
          Notifications
          {notifications.filter((n) => !n.isRead).length > 0 && (
            <span className="bg-coral text-coral-dark text-xs font-bold rounded-full px-2 py-0.5">
              {notifications.filter((n) => !n.isRead).length} new
            </span>
          )}
        </h2>
        {notifications.length === 0 ? (
          <p className="text-muted text-sm">No notifications.</p>
        ) : (
          <ul className="space-y-2.5">
            {notifications.slice(0, 5).map((n) => (
              <li key={n._id} className="text-sm text-cream">
                {n.message}
              </li>
            ))}
          </ul>
        )}
      </div>

      {segment && (
        <div className="bg-surface rounded p-6 border-t-[3px] border-lime md:col-span-2 lg:col-span-3">
          <span className="inline-block bg-lime text-lime-dark text-xs font-bold uppercase tracking-wider rounded px-2.5 py-1 mb-3">
            Your profile
          </span>
          <div className="flex flex-wrap gap-2 mb-3">
            {segment.segments.map((tag) => (
              <span key={tag} className="bg-ink text-cream text-xs font-medium rounded px-3 py-1.5 border border-surface-light">
                {tag.replace(/_/g, " ")}
              </span>
            ))}
          </div>
          <p className="text-muted text-sm">
            {segment.stats.totalOrders} orders • <span className="font-mono text-coral">₹{segment.stats.totalSpend}</span> total spend
          </p>
        </div>
      )}
    </div>
  );
}

export default BuyerDashboard;