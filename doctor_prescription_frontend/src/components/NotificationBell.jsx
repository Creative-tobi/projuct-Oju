import React, { useState, useEffect } from "react";
import { Bell, CheckCheck, Calendar, XCircle, Loader2 } from "lucide-react";
import api from "../api/axios";

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get("/notifications");
      const data = res.data.data || [];
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.isRead).length);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.patch("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark as read", error);
    }
  };

  const getIcon = (type) => {
    if (type === "booking_confirmed")
      return <CheckCheck className="w-5 h-5 text-green-500" />;
    if (type === "booking_declined")
      return <XCircle className="w-5 h-5 text-red-500" />;
    return <Calendar className="w-5 h-5 text-primary" />;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-gray-400 hover:text-primary transition-colors relative p-2">
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden animate-fade-in-up">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
              <h3 className="font-bold text-gray-900 dark:text-white">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-primary font-medium hover:underline">
                  Mark all as read
                </button>
              )}
            </div>
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-8 flex justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : notifications.length > 0 ? (
                notifications.map((n) => (
                  <div
                    key={n._id}
                    className={`p-4 border-b border-gray-50 dark:border-gray-700/50 last:border-0 flex gap-3 ${!n.isRead ? "bg-primary/5 dark:bg-primary/10" : ""}`}>
                    <div className="mt-1">{getIcon(n.type)}</div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-800 dark:text-gray-200">
                        {n.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(n.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                  No notifications yet.
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
export default NotificationBell;
