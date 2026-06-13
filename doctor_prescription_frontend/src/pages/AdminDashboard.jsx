import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Shield,
  LayoutDashboard,
  Users,
  UserCheck,
  Calendar,
  FileText,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import api from "../api/axios";
import AdminOverview from "../admincomponents/AdminOverview";
import AdminDoctors from "../admincomponents/AdminDoctors";
import AdminAppointments from "../admincomponents/AdminAppointments";
import AdminLogs from "../admincomponents/AdminLogs";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { tab } = useParams();
  const activeTab = tab || "overview";
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [adminName, setAdminName] = useState("Administrator");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    navigate("/admin-login");
  };

  const navItems = [
    {
      id: "overview",
      icon: <LayoutDashboard className="w-5 h-5" />,
      label: "Overview",
    },
    {
      id: "doctors",
      icon: <UserCheck className="w-5 h-5" />,
      label: "Manage Doctors",
    },
    {
      id: "appointments",
      icon: <Calendar className="w-5 h-5" />,
      label: "All Appointments",
    },
    {
      id: "logs",
      icon: <FileText className="w-5 h-5" />,
      label: "Activity Logs",
    },
  ];

  return (
    <div className="h-screen flex bg-gray-50 dark:bg-gray-900 transition-colors duration-300 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 border-r border-gray-800 flex flex-col transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
              <Shield className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-white">Oju Admin</span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden text-gray-400 hover:text-white p-1">
            <X className="w-6 h-6" />
          </button>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                navigate(`/admin-dashboard/${item.id}`);
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                activeTab === item.id
                  ? "bg-red-600/20 text-red-500 border border-red-600/30"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}>
              {item.icon} {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-red-400 hover:bg-red-500/10 transition-colors">
            <LogOut className="w-5 h-5" /> Log Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 md:px-8 py-4 flex justify-between items-center z-10 shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden text-gray-500 p-1">
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white capitalize">
              {activeTab.replace("-", " ")}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                {adminName}
              </p>
              <p className="text-xs text-red-500 font-medium">
                System Administrator
              </p>
            </div>
            <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-bold">
              A
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {activeTab === "overview" && <AdminOverview />}
            {activeTab === "doctors" && <AdminDoctors />}
            {activeTab === "appointments" && <AdminAppointments />}
            {activeTab === "logs" && <AdminLogs />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
