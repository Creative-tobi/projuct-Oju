import React, { useState, useEffect } from "react";
import { Users, UserCheck, Calendar, TrendingUp, Loader2 } from "lucide-react";
import api from "../api/axios";

const AdminOverview = () => {
  const [stats, setStats] = useState({ totalDoctors: 0, pendingDoctors: 0, totalPatients: 0, totalAppointments: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/admin/dashboard-stats");
        setStats(res.data);
      } catch (error) {
        console.error("Failed to fetch stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-red-600" /></div>;

  const cards = [
    { title: "Total Doctors", value: stats.totalDoctors, icon: <UserCheck className="w-6 h-6 text-blue-500" />, color: "bg-blue-50 dark:bg-blue-900/20" },
    { title: "Pending Approval", value: stats.pendingDoctors, icon: <Users className="w-6 h-6 text-yellow-500" />, color: "bg-yellow-50 dark:bg-yellow-900/20" },
    { title: "Total Patients", value: stats.totalPatients, icon: <Users className="w-6 h-6 text-green-500" />, color: "bg-green-50 dark:bg-green-900/20" },
    { title: "Total Appointments", value: stats.totalAppointments, icon: <Calendar className="w-6 h-6 text-purple-500" />, color: "bg-purple-50 dark:bg-purple-900/20" },
  ];

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.color}`}>
                {card.icon}
              </div>
              <TrendingUp className="w-5 h-5 text-gray-400" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{card.value}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{card.title}</p>
          </div>
        ))}
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-8 text-center">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">System Status: Healthy</h3>
        <p className="text-gray-500 dark:text-gray-400">All services are running normally. Use the sidebar to manage doctors, monitor appointments, or review activity logs.</p>
      </div>
 
    </div>
  );
};

export default AdminOverview;