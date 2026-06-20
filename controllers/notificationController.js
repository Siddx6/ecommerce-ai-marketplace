import Notification from "../models/Notification.js";

export const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ buyer: req.user.id })
      .populate("product", "title price images")
      .sort({ createdAt: -1 });

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    res.status(200).json({ count: notifications.length, unreadCount, notifications });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    if (notification.buyer.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only update your own notifications" });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({ message: "Marked as read", notification });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};