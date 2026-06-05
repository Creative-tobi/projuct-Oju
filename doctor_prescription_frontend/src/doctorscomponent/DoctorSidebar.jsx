import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Eye,
  Home,
  Calendar,
  Users,
  Activity,
  Settings,
  LogOut,
  X,
  User,
} from "lucide-react";

const DoctorSidebar = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const { tab } = useParams();
  const activeTab = tab || "overview";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    navigate("/login");
  };

  const navItems = [
    { id: "overview", icon: <Home className="w-5 h-5" />, label: "Overview" },
    {
      id: "appointments",
      icon: <Calendar className="w-5 h-5" />,
      label: "Schedule & Appointments",
    },
    {
      id: "patients",
      icon: <Users className="w-5 h-5" />,
      label: "Patient Directory",
    },
    {
      id: "wadi-triage",
      icon: <Activity className="w-5 h-5" />,
      label: "Wadi Triage",
    },
  ];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-6 flex items-center justify-between">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate("/")}>
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-md">
              <Eye className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              Oju Specialist
            </span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="md:hidden text-gray-400 hover:text-primary transition-colors p-1">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                navigate(`/doctor-dashboard/${item.id}`);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                activeTab === item.id
                  ? "bg-primary/10 text-primary"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white"
              }`}>
              {item.icon} {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
          <button
            onClick={() => {
              navigate("/profile");
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white transition-colors">
            <User className="w-5 h-5" /> Profile Settings
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
            <LogOut className="w-5 h-5" /> Log Out
          </button>
        </div>
      </aside>
    </>
  );
};

export default DoctorSidebar;
