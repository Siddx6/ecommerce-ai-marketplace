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

  if (loading) return <p className="text-[#6B6B76]">Loading your dashboard...</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="bg-white border border-[#E4E4EA] rounded-lg p-6">
        <h2 className="font-display font-bold text-[#1A1A22] mb-4">
          Your Orders ({orders.length})
        </h2>
        {orders.length === 0 ? (
          <p className="text-[#6B6B76] text-sm">No orders yet.</p>
        ) : (
          <ul className="space-y-2.5">
            {orders.slice(0, 5).map((order) => (
              <li key={order._id} className="text-sm flex justify-between">
                <span className="text-[#1A1A22]">{order.items.length} item(s)</span>
                <span className="text-[#5B3DF5] font-semibold">₹{order.totalAmount}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="bg-white border border-[#E4E4EA] rounded-lg p-6">
        <h2 className="font-display font-bold text-[#1A1A22] mb-4">
          Wishlist ({wishlist.length})
        </h2>
        {wishlist.length === 0 ? (
          <p className="text-[#6B6B76] text-sm">Nothing saved yet.</p>
        ) : (
          <ul className="space-y-2.5">
            {wishlist.map((item) => (
              <li key={item._id} className="text-sm text-[#1A1A22]">
                {item.product?.title} —{" "}
                <span className="text-[#5B3DF5] font-semibold">
                  ₹{item.product?.price}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="bg-white border border-[#E4E4EA] rounded-lg p-6">
        <h2 className="font-display font-bold text-[#1A1A22] mb-4 flex items-center gap-2">
          Notifications
          {notifications.filter((n) => !n.isRead).length > 0 && (
            <span className="bg-[#FFA41C] text-[#14161C] text-xs font-bold rounded-full px-2 py-0.5">
              {notifications.filter((n) => !n.isRead).length} new
            </span>
          )}
        </h2>
        {notifications.length === 0 ? (
          <p className="text-[#6B6B76] text-sm">No notifications.</p>
        ) : (
          <ul className="space-y-2.5">
            {notifications.slice(0, 5).map((n) => (
              <li key={n._id} className="text-sm text-[#1A1A22]">
                {n.message}
              </li>
            ))}
          </ul>
        )}
      </div>

      {segment && (
        <div className="bg-white border border-[#E4E4EA] rounded-lg p-6 border-t-4 border-t-[#5B3DF5] md:col-span-2 lg:col-span-3">
          <span className="inline-block bg-[#EDEBFF] text-[#5B3DF5] text-xs font-bold uppercase tracking-wide rounded px-2.5 py-1 mb-3">
            Your profile
          </span>
          <div className="flex flex-wrap gap-2 mb-3">
            {segment.segments.map((tag) => (
              <span
                key={tag}
                className="bg-[#F3F3F6] text-[#1A1A22] text-xs font-medium rounded px-3 py-1.5 border border-[#E4E4EA]"
              >
                {tag.replace(/_/g, " ")}
              </span>
            ))}
          </div>
          <p className="text-[#6B6B76] text-sm">
            {segment.stats.totalOrders} orders •{" "}
            <span className="text-[#5B3DF5] font-semibold">
              ₹{segment.stats.totalSpend}
            </span>{" "}
            total spend
          </p>
        </div>
      )}
    </div>
  );
}

export default BuyerDashboard;