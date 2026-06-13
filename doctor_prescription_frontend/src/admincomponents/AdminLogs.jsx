import React, { useState, useEffect } from "react";
import { Shield, Trash2, UserCheck, Calendar, Loader2 } from "lucide-react";
import api from "../api/axios";

const AdminLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get("/admin/activity-logs");
        setLogs(res.data.data || []);
      } catch (error) {
        console.error("Failed to fetch logs", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const getIcon = (action) => {
    if (action.includes("DELETED"))
      return <Trash2 className="w-5 h-5 text-red-500" />;
    if (action.includes("APPROVED"))
      return <UserCheck className="w-5 h-5 text-green-500" />;
    return <Shield className="w-5 h-5 text-blue-500" />;
  };

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-red-600" />
      </div>
    );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden animate-fade-in-up">
      <div className="p-6 border-b border-gray-100 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-red-600" /> System Activity Audit
          Trail
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Secure record of all administrative actions performed on the platform.
        </p>
      </div>
      <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-[600px] overflow-y-auto">
        {logs.length > 0 ? (
          logs.map((log) => (
            <div
              key={log._id}
              className="p-4 flex items-start gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
              <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0">
                {getIcon(log.action)}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  <span className="text-red-600 font-bold">Admin</span>{" "}
                  {log.action.replace(/_/g, " ").toLowerCase()}
                </p>
                {log.details && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {log.details}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-2">
                  {new Date(log.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            No activity logs found.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLogs;
