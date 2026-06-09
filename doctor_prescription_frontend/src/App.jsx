import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Import all actual pages
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import AssessmentPage from "./pages/AssessmentPage";
import PatientDashboard from "./pages/PatientDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import ProfilePage from "./pages/ProfilePage";

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/assessment" element={<AssessmentPage />} />

      {/* Patient Dashboard Routes */}
      <Route
        path="/patient-dashboard"
        element={<Navigate to="/patient-dashboard/overview" replace />}
      />

      {/* 🔴 NEW: Dedicated Profile Route for Patients (MUST be before the :tab catch-all) */}
      <Route path="/patient-dashboard/profile" element={<ProfilePage />} />
      <Route path="/patient-dashboard/:tab" element={<PatientDashboard />} />

      {/* Doctor Dashboard Routes */}
      <Route
        path="/doctor-dashboard"
        element={<Navigate to="/doctor-dashboard/overview" replace />}
      />

      {/* 🔴 NEW: Dedicated Profile Route for Doctors (MUST be before the :tab catch-all) */}
      <Route path="/doctor-dashboard/profile" element={<ProfilePage />} />
      <Route path="/doctor-dashboard/:tab" element={<DoctorDashboard />} />
    </Routes>
  );
}

export default App;
