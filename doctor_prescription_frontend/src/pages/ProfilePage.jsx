import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Building,
  DollarSign,
  Award,
  Edit2,
  Save,
  Loader2,
  CheckCircle2,
  X,
  Menu,
  Bell,
} from "lucide-react";
import api from "../api/axios";

// 🔴 NEW: Import BOTH sidebars
import Sidebar from "../components/Sidebar";
import DoctorSidebar from "../doctorscomponent/DoctorSidebar";

const ProfilePage = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem("userRole") || "user";
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    profilePicture:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=150&h=150&fit=crop",
    specialty: "",
    clinicName: "",
    consultationFee: "",
    experience: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/profile/me");
        if (response.data && response.data.data) {
          setFormData((prev) => ({
            ...prev,
            ...response.data.data,
            fullName:
              response.data.data.fullName || response.data.data.name || "",
            profilePicture:
              response.data.data.profilePicture ||
              response.data.data.avatar ||
              prev.profilePicture,
          }));
        }
      } catch (error) {
        console.error(
          "Could not fetch profile, falling back to empty state.",
          error,
        );
        setFormData((prev) => ({
          ...prev,
          fullName: role === "doctor" ? "Dr. Jane Doe" : "Olasunkanmi",
          email: "user@projectoju.com",
          specialty: "Optometrist",
          clinicName: "Oju Vision Care",
        }));
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [role]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ type: "", text: "" });
    try {
      await api.put("/profile/update", formData);
      setMessage({ type: "success", text: "Profile updated successfully!" });
      setIsEditing(false);
    } catch (error) {
      setMessage({
        type: "error",
        text: "Failed to update profile. Please try again.",
      });
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gray-50 dark:bg-gray-900 transition-colors duration-300 overflow-hidden">
      {/* 🔴 NEW: Conditionally render the correct sidebar based on role */}
      {role === "doctor" ? (
        <DoctorSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      ) : (
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      )}

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 md:px-8 py-4 flex justify-between items-center z-10 shrink-0 transition-colors duration-300">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden text-gray-500 hover:text-primary transition-colors p-1">
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
              Profile Settings
            </h1>
          </div>
          <div className="flex items-center gap-4 md:gap-6">
            <button className="text-gray-400 hover:text-primary transition-colors relative">
              <Bell className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-3 pl-4 md:pl-6 border-l border-gray-200 dark:border-gray-700">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {formData.fullName || "User"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {role}
                </p>
              </div>
              <img
                src={formData.profilePicture}
                alt="Profile"
                className="w-10 h-10 rounded-full border-2 border-primary/20 object-cover"
              />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-3xl mx-auto space-y-8 animate-fade-in-up">
            <div className="flex items-center justify-end">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold transition-all shadow-sm ${isEditing ? "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300" : "bg-primary text-white hover:bg-primary-dark"}`}>
                {isEditing ? (
                  <>
                    <X className="w-4 h-4" /> Cancel Editing
                  </>
                ) : (
                  <>
                    <Edit2 className="w-4 h-4" /> Edit Profile
                  </>
                )}
              </button>
            </div>

            {message.text && (
              <div
                className={`p-4 rounded-xl flex items-center gap-3 ${message.type === "success" ? "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400"}`}>
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium">{message.text}</span>
              </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-all duration-300">
              <div className="h-32 bg-gradient-to-r from-primary to-primary-dark relative">
                <div className="absolute -bottom-12 left-8">
                  <div className="relative">
                    <img
                      src={formData.profilePicture}
                      alt="Profile Avatar"
                      className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-800 object-cover bg-white"
                    />
                  </div>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="pt-16 pb-8 px-8">
                <div className="mb-8 border-b border-gray-100 dark:border-gray-700 pb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {formData.fullName || "Complete your profile"}
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 capitalize flex items-center gap-2">
                    {role === "doctor" ? (
                      <Briefcase className="w-4 h-4 text-primary" />
                    ) : (
                      <User className="w-4 h-4 text-primary" />
                    )}
                    {role === "doctor"
                      ? formData.specialty || "Specialist"
                      : "Patient Account"}
                  </p>
                </div>

                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:border-primary text-gray-900 dark:text-white disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          disabled={true}
                          className="w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none text-gray-500 dark:text-gray-400 cursor-not-allowed transition-colors"
                          title="Email cannot be changed directly"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:border-primary text-gray-900 dark:text-white disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Home / Clinic Address
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:border-primary text-gray-900 dark:text-white disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  {role === "doctor" && (
                    <div className="mt-10 border-t border-gray-100 dark:border-gray-700 pt-8 space-y-6">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                        Professional Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Specialty
                          </label>
                          <div className="relative">
                            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <select
                              name="specialty"
                              value={formData.specialty}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                              className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:border-primary text-gray-900 dark:text-white disabled:opacity-70 disabled:cursor-not-allowed appearance-none transition-colors">
                              <option value="">Select Specialty</option>
                              <option value="Optometrist">Optometrist</option>
                              <option value="Ophthalmologist">
                                Ophthalmologist
                              </option>
                              <option value="Glaucoma Specialist">
                                Glaucoma Specialist
                              </option>
                              <option value="Pediatric Optometrist">
                                Pediatric Optometrist
                              </option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Clinic/Hospital Name
                          </label>
                          <div className="relative">
                            <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type="text"
                              name="clinicName"
                              value={formData.clinicName}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                              className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:border-primary text-gray-900 dark:text-white disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Consultation Fee (₦)
                          </label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type="number"
                              name="consultationFee"
                              value={formData.consultationFee}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                              className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:border-primary text-gray-900 dark:text-white disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
                              placeholder="e.g. 5000"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Years of Experience
                          </label>
                          <div className="relative">
                            <Award className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type="number"
                              name="experience"
                              value={formData.experience}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                              className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:border-primary text-gray-900 dark:text-white disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
                              placeholder="e.g. 5"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {isEditing && (
                  <div className="mt-10 flex justify-end">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="bg-primary text-white px-8 py-3.5 rounded-xl font-bold hover:bg-primary-dark transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-primary/30 disabled:opacity-70">
                      {isSaving ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <Save className="w-5 h-5" /> Save Changes
                        </>
                      )}
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
