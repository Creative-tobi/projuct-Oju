import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "./context/ThemeContext";

// Import all actual pages
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import AssessmentPage from "./pages/AssessmentPage";
import PatientDashboard from "./pages/PatientDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import ProfilePage from "./pages/ProfilePage";

const App = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className="relative min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* Global Floating Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="fixed bottom-6 right-6 z-50 p-3 rounded-full shadow-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:scale-110 transition-transform duration-200 flex items-center justify-center"
        aria-label="Toggle Dark Mode">
        {isDarkMode ? (
          <Sun className="w-6 h-6" />
        ) : (
          <Moon className="w-6 h-6" />
        )}
      </button>

      {/* Application Routing */}
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/assessment" element={<AssessmentPage />} />

        {/* Protected Patient Routes (Dynamic Tab Routing) */}
        <Route
          path="/patient-dashboard"
          element={<Navigate to="/patient-dashboard/overview" replace />}
        />
        <Route path="/patient-dashboard/:tab" element={<PatientDashboard />} />

        {/* Protected Doctor Routes (Dynamic Tab Routing) */}
        <Route
          path="/doctor-dashboard"
          element={<Navigate to="/doctor-dashboard/overview" replace />}
        />
        <Route path="/doctor-dashboard/:tab" element={<DoctorDashboard />} />

        {/* Protected Shared Routes */}
        <Route path="/profile" element={<ProfilePage />} />

        {/* 404 Catch-all */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300">
              <h1 className="text-5xl font-bold mb-4 text-primary">404</h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Oops! This page doesn't exist.
              </p>
            </div>
          }
        />
      </Routes>
    </div>
  );
};

export default App;
