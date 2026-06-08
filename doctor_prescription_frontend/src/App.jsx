import { BrowserRouter as Router } from "react-router-dom";
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

function App() {
  return (
    // <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/assessment" element={<AssessmentPage />} />

        {/* Patient Dashboard Routes */}
        {/* If they visit just /patient-dashboard, redirect them to overview */}
        <Route
          path="/patient-dashboard"
          element={<Navigate to="/patient-dashboard/overview" replace />}
        />
        {/* The :tab parameter captures "appointments", "book", "records", etc. */}
        <Route path="/patient-dashboard/:tab" element={<PatientDashboard />} />

        {/* Doctor Dashboard Routes */}
        <Route
          path="/doctor-dashboard"
          element={<Navigate to="/doctor-dashboard/overview" replace />}
        />
        <Route path="/doctor-dashboard/:tab" element={<DoctorDashboard />} />

        {/* Profile Route */}
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    // </Router>
  );
}

export default App;