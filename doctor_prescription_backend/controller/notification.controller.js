const Notification = require("../model/notification.model");

// Get notifications for the logged-in user
exports.getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipientId: req.user.id,
      recipientRole: req.user.role,
    })
      .sort({ createdAt: -1 })
      .limit(20);
    res.status(200).json({ count: notifications.length, data: notifications });
  } catch (error) {
    console.error("Fetch Notifications Error:", error);
    res.status(500).json({ error: "Server error fetching notifications." });
  }
};

// Mark all as read
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipientId: req.user.id, recipientRole: req.user.role },
      { isRead: true },
    );
    res.status(200).json({ message: "All notifications marked as read." });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Server error marking notifications as read." });
  }
};

// 🔴 HELPER: Used by other controllers to trigger notifications
exports.createNotification = async (
  recipientId,
  recipientRole,
  message,
  type,
  appointmentId = null,
) => {
  try {
    await Notification.create({
      recipientId,
      recipientRole,
      message,
      type,
      relatedAppointment: appointmentId,
    });
  } catch (error) {
    console.error("Notification creation failed:", error);
  }
};
