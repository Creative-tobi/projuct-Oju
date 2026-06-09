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
  Camera,
  Briefcase,
  Building,
  DollarSign,
} from "lucide-react";
import api from "../api/axios";

const LoginPage = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState("user");
  const [showOTP, setShowOTP] = useState(false);

  // Form States
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    otp: "",
    speciality: "",
    clinicName: "",
    consultationFee: "",
    qualifications: "",
  });

  // Image Upload States
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError("");
      try {
        if (isLogin) {
          // --- LOGIN FLOW (Remains JSON) ---
          const response = await api.post("/auth/login", {
            email: formData.email,
            password: formData.password,
            role: role,
          });
          localStorage.setItem("token", response.data.token);
          localStorage.setItem("userRole", role);
          navigate(
            role === "doctor" ? "/doctor-dashboard" : "/patient-dashboard",
          );
        } else {
          // --- REGISTRATION FLOW (MUST BE FORMDATA) ---
          const formDataObj = new FormData();
          formDataObj.append("fullName", formData.fullName);
          formDataObj.append("email", formData.email);
          formDataObj.append("password", formData.password);
          formDataObj.append("phone", formData.phone);
          formDataObj.append("address", formData.address);
          formDataObj.append("role", role);

          // Append Doctor-specific fields if role is doctor
          if (role === "doctor") {
            formDataObj.append("speciality", formData.speciality);
            formDataObj.append("clinicName", formData.clinicName);
            formDataObj.append("consultationFee", formData.consultationFee);
            formDataObj.append("qualifications", formData.qualifications);
            formDataObj.append("experience", formData.experience || "0");
          }

          // Append image if one was selected
          if (imageFile) {
            formDataObj.append("image", imageFile);
          }

          // ⚠️ IMPORTANT: Do NOT manually set "Content-Type": "multipart/form-data" here.
          // Axios automatically sets it with the correct boundary when you pass a FormData object.
          await api.post("/auth/register", formDataObj);

          setSuccessMsg(
            `Registration successful! We sent an OTP to ${formData.email}.`,
          );
          setShowOTP(true);
        }
      } catch (err) {
        setError(
          err.response?.data?.error ||
            err.response?.data?.message ||
            "Something went wrong.",
        );
      } finally {
        setLoading(false);
      }
    };

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
        setIsLogin(true);
        setSuccessMsg("");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || "Invalid OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-16 lg:px-24 py-12 relative overflow-y-auto">
        <button
          onClick={() => navigate("/")}
          className="absolute top-8 left-8 flex items-center gap-2 text-gray-500 hover:text-primary transition-colors font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>
        <div className="max-w-md w-full mx-auto pt-12 pb-12">
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
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {isLogin ? "Welcome back" : "Create an account"}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-8">
                {isLogin
                  ? "Please enter your details to sign in."
                  : "Join our digital eye care platform today."}
              </p>

              <div className="flex p-1 bg-gray-200 dark:bg-gray-800 rounded-lg mb-8">
                <button
                  onClick={() => setRole("user")}
                  className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${role === "user" ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm" : "text-gray-500"}`}>
                  Patient
                </button>
                <button
                  onClick={() => setRole("doctor")}
                  className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${role === "doctor" ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm" : "text-gray-500"}`}>
                  Specialist
                </button>
              </div>

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

              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <>
                    {/* 🔴 NEW: Profile Image Upload */}
                    <div className="flex flex-col items-center gap-2 mb-2">
                      <div className="relative">
                        <img
                          src={
                            imagePreview ||
                            `https://ui-avatars.com/api/?name=${role === "doctor" ? "Doctor" : "User"}`
                          }
                          className="w-20 h-20 rounded-full object-cover border-2 border-primary/20"
                          alt="Preview"
                        />
                        <label className="absolute bottom-0 right-0 w-7 h-7 bg-primary rounded-full flex items-center justify-center cursor-pointer text-white shadow-md hover:bg-primary-dark transition-colors">
                          <Camera className="w-4 h-4" />
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageChange}
                          />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Upload Profile Photo
                      </p>
                    </div>

                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        name="fullName"
                        required
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary outline-none dark:text-white"
                        placeholder="Full Name"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="tel"
                          name="phone"
                          required
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary outline-none dark:text-white"
                          placeholder="Phone"
                        />
                      </div>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          name="address"
                          required
                          value={formData.address}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary outline-none dark:text-white"
                          placeholder="Address"
                        />
                      </div>
                    </div>

                    {/* 🔴 NEW: Doctor Specific Fields */}
                    {role === "doctor" && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1 ml-1">
                              Specialty
                            </label>
                            <select
                              name="speciality"
                              value={formData.speciality}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary outline-none dark:text-white">
                              <option value="">Select</option>
                              <option value="Optometrist">Optometrist</option>
                              <option value="Ophthalmologist">
                                Ophthalmologist
                              </option>
                              <option value="Glaucoma Specialist">
                                Glaucoma
                              </option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1 ml-1">
                              Fee (₦)
                            </label>
                            <input
                              type="number"
                              name="consultationFee"
                              value={formData.consultationFee}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary outline-none dark:text-white"
                              placeholder="5000"
                            />
                          </div>
                        </div>
                        <div className="relative">
                          <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            name="clinicName"
                            value={formData.clinicName}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary outline-none dark:text-white"
                            placeholder="Clinic / Hospital Name"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1 ml-1">
                            Qualifications
                          </label>
                          <textarea
                            name="qualifications"
                            value={formData.qualifications}
                            onChange={handleInputChange}
                            rows="2"
                            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary outline-none dark:text-white"
                            placeholder="e.g. MBBS, FWACS"
                          />
                        </div>
                      </>
                    )}
                  </>
                )}

                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary outline-none dark:text-white"
                    placeholder="Email"
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary outline-none dark:text-white"
                    placeholder="Password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-white py-3.5 rounded-xl font-bold hover:bg-primary-dark transition-all flex items-center justify-center shadow-lg disabled:opacity-70">
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : isLogin ? (
                    "Sign In"
                  ) : (
                    "Create Account"
                  )}
                </button>
              </form>
              <p className="text-center mt-8 text-gray-600 dark:text-gray-400">
                {isLogin
                  ? "Don't have an account? "
                  : "Already have an account? "}
                <button
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError("");
                  }}
                  className="font-bold text-primary hover:text-primary-dark">
                  {isLogin ? "Sign up" : "Log in"}
                </button>
              </p>
            </>
          ) : (
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
              <form onSubmit={handleVerifyOTP} className="space-y-6">
                <input
                  type="text"
                  name="otp"
                  required
                  maxLength="6"
                  value={formData.otp}
                  onChange={handleInputChange}
                  className="w-full text-center tracking-widest text-2xl font-bold py-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary outline-none dark:text-white"
                  placeholder="000000"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-white py-3.5 rounded-xl font-bold hover:bg-primary-dark transition-all flex items-center justify-center shadow-lg disabled:opacity-70">
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
      <div className="hidden lg:flex w-1/2 bg-primary relative overflow-hidden items-center justify-center">
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-primary-light/40 to-primary-dark/80 z-10"></div>
        <div className="relative z-20 text-center px-12 text-white">
          <div className="w-32 h-32 border-4 border-white/20 rounded-full flex items-center justify-center mx-auto mb-8 backdrop-blur-sm">
            <Eye className="w-16 h-16 text-white" />
          </div>
          <h2 className="text-4xl font-bold mb-4">
            Vision Care, <br /> Reimagined.
          </h2>
          <p className="text-lg text-white/80 max-w-md mx-auto">
            {role === "user"
              ? "Join thousands of patients accessing premium eye care from the comfort of their homes."
              : "Expand your practice. Connect with patients securely through our digital clinic tools."}
          </p>
        </div>
      </div>
    </div>
  );
};
export default LoginPage;
