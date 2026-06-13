import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  MapPin,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Search,
} from "lucide-react";
import api from "../api/axios";

const DashboardBookDoctor = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Booking Workflow States
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [slotsData, setSlotsData] = useState({
    available: [],
    booked: [],
    all: [],
  });
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState("");

  const [bookingType, setBookingType] = useState("Online Video Consult");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await api.get("/patient/doctors");
        if (response.data && response.data.data) {
          setDoctors(response.data.data);
          setFilteredDoctors(response.data.data);
        } else {
          loadFallbackDoctors();
        }
      } catch (error) {
        console.error("Backend not ready, loading dummy doctors.", error);
        loadFallbackDoctors();
      } finally {
        setIsLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  // 🔴 NEW: Fetch Slots when Date Changes
  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      const fetchSlots = async () => {
        setIsLoadingSlots(true);
        setSlotsData({ available: [], booked: [], all: [] });
        setSelectedSlot(""); // Reset selected slot when date changes
        setErrorMsg("");
        try {
          // Adjust URL if you mounted the route in doctor.router.js instead
          const res = await api.get(
            `/patient/doctors/${selectedDoctor._id}/slots?date=${selectedDate}`,
          );
          setSlotsData({
            available: res.data.availableSlots || [],
            booked: res.data.bookedSlots || [],
            all: res.data.allSlots || [],
          });
          if (res.data.message) {
            setErrorMsg(res.data.message); // e.g., "Doctor is not available on Sunday"
          }
        } catch (error) {
          console.error("Error fetching slots", error);
          setErrorMsg("Failed to load schedule.");
        } finally {
          setIsLoadingSlots(false);
        }
      };
      fetchSlots();
    }
  }, [selectedDoctor, selectedDate]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredDoctors(doctors);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = doctors.filter(
        (doc) =>
          doc.fullName?.toLowerCase().includes(query) ||
          doc.speciality?.toLowerCase().includes(query) ||
          doc.clinicName?.toLowerCase().includes(query),
      );
      setFilteredDoctors(filtered);
    }
  }, [searchQuery, doctors]);

  const loadFallbackDoctors = () => {
    const fallback = [
      {
        _id: "1",
        fullName: "Aisha Rahman",
        speciality: "Consultant Optometrist",
        clinicName: "Clear Vision Clinic",
        consultationFee: "5000",
      },
      {
        _id: "2",
        fullName: "Samuel Johnson",
        speciality: "Glaucoma Specialist",
        clinicName: "Lagos Eye Center",
        consultationFee: "8000",
      },
    ];
    setDoctors(fallback);
    setFilteredDoctors(fallback);
  };

      const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSlot) return;
    
    setIsSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");
    
    try {
      const response = await api.post("/patient/book", {
        specialist: selectedDoctor._id,
        appointmentDate: selectedDate,
        time: selectedSlot,
        type: bookingType,
      });
      
      // ✅ SUCCESS! The backend returned a 201 status
      setSuccessMsg(response.data.message || "Appointment successfully booked!");
      
      // Reset the view so they can book another one later
      setSelectedDoctor(null);
      setSelectedDate("");
      setSelectedSlot("");
      
      // Redirect to their appointments list after 3 seconds
      setTimeout(() => navigate("/patient-dashboard/appointments"), 3000);
      
    } catch (error) {
      console.error("🔴 BOOKING FRONTEND ERROR:", error.response);
      
      // 🔴 FIXED: Extract the EXACT error message from the backend terminal
      const backendError = error.response?.data?.error || error.response?.data?.message;
      
      if (backendError) {
        setErrorMsg(backendError); // e.g., "Validation failed: clinicName is required"
      } else if (error.request) {
        setErrorMsg("No response from server. Check your backend terminal for crashes.");
      } else {
        setErrorMsg("An unexpected error occurred.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetBooking = () => {
    setSelectedDoctor(null);
    setSelectedDate("");
    setSlotsData({ available: [], booked: [], all: [] });
    setSelectedSlot("");
    setSuccessMsg("");
    setErrorMsg("");
  };

  if (isLoading)
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );

  return (
    <div className="animate-fade-in-up">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Find a Specialist
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          Browse our network of verified professionals and book an open time
          slot instantly.
        </p>
      </div>

      {!selectedDoctor ? (
        <>
          <div className="relative mb-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, specialty, or clinic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-gray-900 dark:text-white transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.length > 0 ? (
              filteredDoctors.map((doctor) => (
                <div
                  key={doctor._id}
                  className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xl shrink-0">
                      {doctor.fullName?.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1">
                        Dr. {doctor.fullName}
                      </h3>
                      <p className="text-sm text-primary font-medium">
                        {doctor.speciality || "Ophthalmologist"}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2 mb-6 flex-1 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />{" "}
                      {doctor.clinicName || "Digital Clinic"}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" /> Fee: ₦
                      {doctor.consultationFee || "5000"}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedDoctor(doctor)}
                    className="w-full bg-primary/10 text-primary py-3 rounded-xl font-bold hover:bg-primary hover:text-white transition-colors">
                    Select & Book
                  </button>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
                <p>No specialists found matching your search.</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="max-w-4xl bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex justify-between items-center mb-8 border-b border-gray-100 dark:border-gray-700 pb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Book Consultation
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                with Dr. {selectedDoctor.fullName}
              </p>
            </div>
            <button
              onClick={resetBooking}
              className="text-gray-400 hover:text-primary font-medium">
              Cancel
            </button>
          </div>

          {successMsg ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
              <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {successMsg}
              </h4>
              <p className="text-gray-500 dark:text-gray-400">
                Redirecting to your appointments...
              </p>
            </div>
          ) : (
            <form onSubmit={handleBookingSubmit} className="space-y-8">
              {/* Step 1: Select Date */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-primary" /> 1. Select
                  Date
                </label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split("T")[0]}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full md:w-1/2 p-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:border-primary dark:text-white"
                />
              </div>

              {/* Step 2: Select Time Slot */}
              {selectedDate && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" /> 2. Select Time
                    Slot
                  </label>

                  {isLoadingSlots ? (
                    <div className="flex items-center gap-3 text-gray-500 py-8 justify-center">
                      <Loader2 className="w-6 h-6 animate-spin" /> Fetching
                      available slots...
                    </div>
                  ) : errorMsg ? (
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 rounded-xl flex items-center gap-3">
                      <AlertCircle className="w-5 h-5" /> {errorMsg}
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                      {/* Render Available Slots */}
                      {slotsData.available.map((slot) => (
                        <button
                          type="button"
                          key={slot}
                          onClick={() => setSelectedSlot(slot)}
                          className={`py-3 rounded-xl border-2 font-bold text-sm transition-all ${
                            selectedSlot === slot
                              ? "border-primary bg-primary text-white shadow-md"
                              : "border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-primary hover:text-primary"
                          }`}>
                          {slot}
                        </button>
                      ))}

                      {/* Render Booked Slots (Disabled) */}
                      {slotsData.booked.map((slot) => (
                        <button
                          type="button"
                          key={slot}
                          disabled
                          className="py-3 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-gray-400 dark:text-gray-600 font-bold text-sm cursor-not-allowed line-through">
                          {slot}
                        </button>
                      ))}

                      {slotsData.available.length === 0 &&
                        slotsData.booked.length === 0 &&
                        !errorMsg && (
                          <p className="col-span-full text-center text-gray-500 py-4">
                            No slots generated. Check doctor's schedule
                            settings.
                          </p>
                        )}
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Consultation Type & Submit */}
              {selectedSlot && (
                <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                    3. Consultation Type
                  </label>
                  <div className="flex gap-4 mb-6">
                    {["Online Video Consult", "In-Person Clinic Visit"].map(
                      (type) => (
                        <button
                          type="button"
                          key={type}
                          onClick={() => setBookingType(type)}
                          className={`flex-1 py-4 rounded-xl border-2 font-bold transition-all text-sm ${
                            bookingType === type
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-primary"
                          }`}>
                          {type}
                        </button>
                      ),
                    )}
                  </div>

                  {errorMsg && (
                    <div className="p-3 bg-red-100 text-red-600 rounded-lg text-sm mb-4 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" /> {errorMsg}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary text-white py-4 rounded-xl font-bold hover:bg-primary-dark transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-70">
                    {isSubmitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      `Confirm Booking for ${selectedSlot}`
                    )}
                  </button>
                </div>
              )}
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default DashboardBookDoctor;
