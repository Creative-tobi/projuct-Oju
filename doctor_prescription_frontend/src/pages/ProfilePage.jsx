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
  Calendar,
  Clock,
  Camera,
} from "lucide-react";
import api from "../api/axios";
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

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    profilePicture: "https://ui-avatars.com/api/?name=User",
    specialty: "",
    clinicName: "",
    consultationFee: "",
    experience: "",
  });

  const [availability, setAvailability] = useState({
    days: [],
    startTime: "09:00",
    endTime: "17:00",
  });
  const [isEditingSchedule, setIsEditingSchedule] = useState(false);
  const [isSavingSchedule, setIsSavingSchedule] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/profile/me");
        if (response.data && response.data.data) {
          const data = response.data.data;
          setFormData((prev) => ({
            ...prev,
            ...data,
            fullName: data.fullName || "",
            profilePicture:
              data.profilePicture || data.avatar || prev.profilePicture,
          }));

          // Robustly map the availability object
          if (data.availability) {
            setAvailability({
              days: data.availability.days || [],
              startTime: data.availability.startTime || "09:00",
              endTime: data.availability.endTime || "17:00",
            });
          }
        }
      } catch (error) {
        console.error("Could not fetch profile.", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [role]);

  const handleInputChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ type: "", text: "" });
    try {
      // 1. Update text fields
      await api.put("/profile/update", formData);

      // 2. Update image if changed
      if (imageFile) {
        const imgData = new FormData();
        imgData.append("image", imageFile);
        const imgRes = await api.patch("/profile/avatar", imgData);
        const newUrl =
          imgRes.data.data?.profilePicture || imgRes.data.data?.avatar;
        if (newUrl)
          setFormData((prev) => ({ ...prev, profilePicture: newUrl }));
      }

      setMessage({ type: "success", text: "Profile updated successfully!" });
      setIsEditing(false);
      setImageFile(null);
      setImagePreview(null);
    } catch (error) {
      setMessage({ type: "error", text: "Failed to update profile." });
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    }
  };

  const handleSaveSchedule = async () => {
    setIsSavingSchedule(true);
    try {
      // Ensures the payload matches the backend expectation exactly
      await api.put("/provider/schedule", {
        days: availability.days,
        startTime: availability.startTime,
        endTime: availability.endTime,
      });
      setMessage({ type: "success", text: "Schedule updated successfully!" });
      setIsEditingSchedule(false);
    } catch (error) {
      console.error("Schedule save error:", error);
      setMessage({ type: "error", text: "Failed to update schedule." });
    } finally {
      setIsSavingSchedule(false);
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    }
  };

  const toggleDay = (day) => {
    setAvailability((prev) => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter((d) => d !== day)
        : [...prev.days, day],
    }));
  };

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );

  return (
    <div className="h-screen flex bg-gray-50 dark:bg-gray-900 transition-colors duration-300 overflow-hidden">
      {/* 🔴 Conditionally render the correct sidebar based on role */}
      {role === "doctor" ? (
        <DoctorSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      ) : (
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      )}

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 md:px-8 py-4 flex justify-between items-center z-10 shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden text-gray-500 p-1">
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
              Profile Settings
            </h1>
          </div>
          <div className="flex items-center gap-4 md:gap-6">
            <button className="text-gray-400 hover:text-primary relative">
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
          <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">
            {message.text && (
              <div
                className={`p-4 rounded-xl flex items-center gap-3 ${message.type === "success" ? "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400"}`}>
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium">{message.text}</span>
              </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="h-32 bg-gradient-to-r from-primary to-primary-dark relative">
                <div className="absolute -bottom-12 left-8">
                  <div className="relative">
                    <img
                      src={imagePreview || formData.profilePicture}
                      alt="Profile"
                      className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-800 object-cover bg-white"
                    />
                    {isEditing && (
                      <label className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center cursor-pointer text-white shadow-md hover:bg-primary-dark transition-colors">
                        <Camera className="w-4 h-4" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageChange}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="pt-16 pb-8 px-8">
                <div className="mb-8 border-b border-gray-100 dark:border-gray-700 pb-6 flex justify-between items-start">
                  <div>
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
                  <button
                    type="button"
                    onClick={() => setIsEditing(!isEditing)}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold transition-all shadow-sm ${isEditing ? "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300" : "bg-primary text-white hover:bg-primary-dark"}`}>
                    {isEditing ? (
                      <>
                        <X className="w-4 h-4" /> Cancel
                      </>
                    ) : (
                      <>
                        <Edit2 className="w-4 h-4" /> Edit Profile
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:border-primary text-gray-900 dark:text-white disabled:opacity-70"
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
                        value={formData.email}
                        disabled
                        className="w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none text-gray-500 dark:text-gray-400 cursor-not-allowed"
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
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:border-primary text-gray-900 dark:text-white disabled:opacity-70"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Address
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:border-primary text-gray-900 dark:text-white disabled:opacity-70"
                      />
                    </div>
                  </div>
                </div>

                {/* 🔴 DOCTOR SPECIFIC: AVAILABILITY & SCHEDULE TABLE */}
                {role === "doctor" && (
                  <div className="mt-10 border-t border-gray-100 dark:border-gray-700 pt-8 space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-primary" />{" "}
                        Availability & Schedule
                      </h3>
                      {!isEditingSchedule && (
                        <button
                          type="button"
                          onClick={() => setIsEditingSchedule(true)}
                          className="text-sm font-bold text-primary hover:text-primary-dark flex items-center gap-1">
                          <Edit2 className="w-4 h-4" /> Edit Schedule
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Set your regular weekly working hours. Patients will only
                      be able to book within these timeframes.
                    </p>

                    <div className="bg-gray-50 dark:bg-gray-700/30 rounded-2xl border border-gray-100 dark:border-gray-600 overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-bold uppercase tracking-wider">
                            <tr>
                              <th className="px-6 py-4">Day of Week</th>
                              <th className="px-6 py-4">Start Time</th>
                              <th className="px-6 py-4">End Time</th>
                              <th className="px-6 py-4">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {[
                              "Monday",
                              "Tuesday",
                              "Wednesday",
                              "Thursday",
                              "Friday",
                              "Saturday",
                              "Sunday",
                            ].map((day) => {
                              const isActive = availability.days.includes(day);
                              return (
                                <tr
                                  key={day}
                                  className={`${!isActive ? "opacity-50" : ""}`}>
                                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                    {day}
                                  </td>
                                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                    {isEditingSchedule ? (
                                      <input
                                        type="time"
                                        disabled={!isActive}
                                        value={availability.startTime}
                                        onChange={(e) =>
                                          setAvailability({
                                            ...availability,
                                            startTime: e.target.value,
                                          })
                                        }
                                        className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 text-sm"
                                      />
                                    ) : (
                                      availability.startTime
                                    )}
                                  </td>
                                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                    {isEditingSchedule ? (
                                      <input
                                        type="time"
                                        disabled={!isActive}
                                        value={availability.endTime}
                                        onChange={(e) =>
                                          setAvailability({
                                            ...availability,
                                            endTime: e.target.value,
                                          })
                                        }
                                        className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 text-sm"
                                      />
                                    ) : (
                                      availability.endTime
                                    )}
                                  </td>
                                  <td className="px-6 py-4">
                                    {isEditingSchedule ? (
                                      <button
                                        type="button"
                                        onClick={() => toggleDay(day)}
                                        className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${isActive ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}`}>
                                        {isActive ? "Available" : "Unavailable"}
                                      </button>
                                    ) : (
                                      <span
                                        className={`px-3 py-1 rounded-full text-xs font-bold ${isActive ? "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400" : "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400"}`}>
                                        {isActive ? "Available" : "Closed"}
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {isEditingSchedule && (
                        <div className="p-6 bg-gray-100 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-4">
                          <button
                            type="button"
                            onClick={() => {
                              setIsEditingSchedule(false);
                            }}
                            className="px-5 py-2.5 rounded-xl font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleSaveSchedule}
                            disabled={isSavingSchedule}
                            className="px-5 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark flex items-center gap-2 disabled:opacity-70">
                            {isSavingSchedule ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <Save className="w-4 h-4" /> Save Weekly
                                Schedule
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 mt-8">
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
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:border-primary text-gray-900 dark:text-white disabled:opacity-70 appearance-none">
                            <option value="">Select Specialty</option>
                            <option value="Optometrist">Optometrist</option>
                            <option value="Ophthalmologist">
                              Ophthalmologist
                            </option>
                            <option value="Glaucoma Specialist">
                              Glaucoma Specialist
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
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:border-primary text-gray-900 dark:text-white disabled:opacity-70"
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
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:border-primary text-gray-900 dark:text-white disabled:opacity-70"
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
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:border-primary text-gray-900 dark:text-white disabled:opacity-70"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {isEditing && (
                  <div className="mt-10 flex justify-end">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="bg-primary text-white px-8 py-3.5 rounded-xl font-bold hover:bg-primary-dark transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-70">
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
