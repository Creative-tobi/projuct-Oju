import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  ArrowLeft,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import api from "../api/axios";

const LoginPage = () => {
  const navigate = useNavigate();

  // UI States
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState("user"); // 'user' (Patient) or 'doctor'
  const [showOTP, setShowOTP] = useState(false);

  // Form States
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    otp: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(""); // Clear errors when user types
  };

  // 1. Handle Login or Registration Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        // LOGIN FLOW
        const response = await api.post("/auth/login", {
          email: formData.email,
          password: formData.password,
          role: role,
        });

        // Save token and route user
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("userRole", role);

        // Route directly to their personal dashboards!
        if (role === "doctor") {
          navigate("/doctor-dashboard");
        } else {
          navigate("/patient-dashboard");
        }
      } else {
        // REGISTRATION FLOW
        await api.post("/auth/register", {
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          address: formData.address,
          role: role,
        });

        setSuccessMsg(
          `Registration successful! We sent an OTP to ${formData.email}.`,
        );
        setShowOTP(true); // Switch to OTP View
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // 2. Handle OTP Verification
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.post("/auth/verify-otp", {
        email: formData.email,
        otp: formData.otp,
        role: role,
      });

      setSuccessMsg("Email verified successfully! You can now log in.");
      setTimeout(() => {
        setShowOTP(false);
        setIsLogin(true); // Switch back to login view
        setSuccessMsg("");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Left Side: Form Container */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-16 lg:px-24 py-12 relative overflow-y-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/")}
          className="absolute top-8 left-8 flex items-center gap-2 text-gray-500 hover:text-primary transition-colors font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>

        <div className="max-w-md w-full mx-auto pt-12">
          {/* Brand Logo */}
          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-lg">
              <Eye className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              Project Oju
            </span>
          </div>

          {!showOTP ? (
            <>
              {/* Header */}
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {isLogin ? "Welcome back" : "Create an account"}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-8">
                {isLogin
                  ? "Please enter your details to sign in."
                  : "Join our digital eye care platform today."}
              </p>

              {/* Role Toggle */}
              <div className="flex p-1 bg-gray-200 dark:bg-gray-800 rounded-lg mb-8">
                <button
                  onClick={() => setRole("user")}
                  className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
                    role === "user"
                      ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  }`}>
                  Patient
                </button>
                <button
                  onClick={() => setRole("doctor")}
                  className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
                    role === "doctor"
                      ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  }`}>
                  Specialist
                </button>
              </div>

              {/* Error/Success Messages */}
              {error && (
                <div className="p-3 bg-red-100 text-red-600 rounded-lg text-sm mb-6">
                  {error}
                </div>
              )}
              {successMsg && (
                <div className="p-3 bg-green-100 text-green-700 rounded-lg text-sm mb-6 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> {successMsg}
                </div>
              )}

              {/* Main Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          name="fullName"
                          required
                          value={formData.fullName}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all dark:text-white"
                          placeholder={
                            role === "doctor" ? "Dr. Jane Doe" : "Jane Doe"
                          }
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Phone
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="tel"
                            name="phone"
                            required
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all dark:text-white"
                            placeholder="+234..."
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Address
                        </label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            name="address"
                            required
                            value={formData.address}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all dark:text-white"
                            placeholder="City, State"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all dark:text-white"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all dark:text-white"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                {isLogin && (
                  <div className="flex justify-end">
                    <a
                      href="#"
                      className="text-sm font-medium text-primary hover:text-primary-dark">
                      Forgot password?
                    </a>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-white py-3.5 rounded-xl font-bold hover:bg-primary-dark transition-all duration-300 flex items-center justify-center shadow-lg shadow-primary/30 disabled:opacity-70">
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : isLogin ? (
                    "Sign In"
                  ) : (
                    "Create Account"
                  )}
                </button>
              </form>

              {/* Toggle Mode */}
              <p className="text-center mt-8 text-gray-600 dark:text-gray-400">
                {isLogin
                  ? "Don't have an account? "
                  : "Already have an account? "}
                <button
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError("");
                  }}
                  className="font-bold text-primary hover:text-primary-dark transition-colors">
                  {isLogin ? "Sign up" : "Log in"}
                </button>
              </p>
            </>
          ) : (
            /* OTP VERIFICATION VIEW */
            <div className="text-center animate-fade-in-up">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Verify your email
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-8">
                We've sent a 6-digit code to{" "}
                <strong className="text-gray-900 dark:text-white">
                  {formData.email}
                </strong>
              </p>

              {error && (
                <div className="p-3 bg-red-100 text-red-600 rounded-lg text-sm mb-6">
                  {error}
                </div>
              )}
              {successMsg && (
                <div className="p-3 bg-green-100 text-green-700 rounded-lg text-sm mb-6 flex items-center gap-2 justify-center">
                  <CheckCircle2 className="w-4 h-4" /> {successMsg}
                </div>
              )}

              <form onSubmit={handleVerifyOTP} className="space-y-6">
                <input
                  type="text"
                  name="otp"
                  required
                  maxLength="6"
                  value={formData.otp}
                  onChange={handleInputChange}
                  className="w-full text-center tracking-widest text-2xl font-bold py-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all dark:text-white"
                  placeholder="000000"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-white py-3.5 rounded-xl font-bold hover:bg-primary-dark transition-all duration-300 flex items-center justify-center shadow-lg shadow-primary/30 disabled:opacity-70">
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Verify Code"
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Right Side: Visual/Branding (Hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 bg-primary relative overflow-hidden items-center justify-center">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-primary-light/40 to-primary-dark/80 z-10"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl z-0"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-black/10 rounded-full blur-3xl z-0"></div>

        {/* Abstract Medical Graphic */}
        <div className="relative z-20 text-center px-12 text-white">
          <div className="w-32 h-32 border-4 border-white/20 rounded-full flex items-center justify-center mx-auto mb-8 backdrop-blur-sm">
            <Eye className="w-16 h-16 text-white" />
          </div>
          <h2 className="text-4xl font-bold mb-4">
            Vision Care,
            <br />
            Reimagined.
          </h2>
          <p className="text-lg text-white/80 max-w-md mx-auto">
            {role === "user"
              ? "Join thousands of patients accessing premium eye care from the comfort of their homes."
              : "Expand your practice. Connect with patients securely through our digital clinic tools."}
          </p>
        </div>

        {/* Background Image Overlay */}
        <img
          src="https://images.unsplash.com/photo-1576091160550-2173ff9e5ee5?auto=format&fit=crop&q=80&w=1000"
          alt="Medical Background"
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-40 z-0"
        />
      </div>
    </div>
  );
};;

export default LoginPage;
