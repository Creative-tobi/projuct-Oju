import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import AssessmentPage from "./pages/AssessmentPage";
import PatientDashboard from "./pages/PatientDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import ProfilePage from "./pages/ProfilePage";
// 🔴 NEW ADMIN IMPORTS
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/assessment" element={<AssessmentPage />} />

      {/* 🔴 NEW: Admin Routes */}
      <Route path="/admin-login" element={<AdminLoginPage />} />
      <Route
        path="/admin-dashboard"
        element={<Navigate to="/admin-dashboard/overview" replace />}
      />
      <Route path="/admin-dashboard/:tab" element={<AdminDashboard />} />

      {/* Patient Dashboard Routes */}
      <Route
        path="/patient-dashboard"
        element={<Navigate to="/patient-dashboard/overview" replace />}
      />
      <Route path="/patient-dashboard/profile" element={<ProfilePage />} />
      <Route path="/patient-dashboard/:tab" element={<PatientDashboard />} />

      {/* Doctor Dashboard Routes */}
      <Route
        path="/doctor-dashboard"
        element={<Navigate to="/doctor-dashboard/overview" replace />}
      />
      <Route path="/doctor-dashboard/profile" element={<ProfilePage />} />
      <Route path="/doctor-dashboard/:tab" element={<DoctorDashboard />} />
    </Routes>
  );
}

export default App;
