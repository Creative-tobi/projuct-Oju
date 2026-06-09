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
} from "lucide-react";
import api from "../api/axios";

const DashboardBookDoctor = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Booking Workflow States
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [slots, setSlots] = useState({ available: [], booked: [], day: "" });
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState("");

  const [bookingType, setBookingType] = useState("Online Video Consult");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await api.get("/doctors"); // Public route
        if (response.data && response.data.data) {
          setDoctors(response.data.data);
        } else {
          loadFallbackDoctors();
        }
      } catch (error) {
        loadFallbackDoctors();
      } finally {
        setIsLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  // 🔴 Fetch Slots when Date Changes
  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      const fetchSlots = async () => {
        setIsLoadingSlots(true);
        setSlots({ available: [], booked: [], day: "" });
        setSelectedSlot(""); // Reset selected slot
        try {
          const res = await api.get(
            `/doctors/${selectedDoctor._id}/slots?date=${selectedDate}`,
          );
          setSlots(res.data);
          if (res.data.message) setErrorMsg(res.data.message);
          else setErrorMsg("");
        } catch (error) {
          setErrorMsg("Failed to load schedule.");
        } finally {
          setIsLoadingSlots(false);
        }
      };
      fetchSlots();
    }
  }, [selectedDoctor, selectedDate]);

  const loadFallbackDoctors = () => {
    setDoctors([
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
    ]);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSlot) return;

    setIsSubmitting(true);
    setErrorMsg("");
    try {
      await api.post("/patient/book", {
        doctorId: selectedDoctor._id,
        appointmentDate: selectedDate,
        time: selectedSlot,
        type: bookingType,
      });
      setSuccessMsg("Appointment successfully booked!");
      setTimeout(() => navigate("/patient-dashboard/appointments"), 2500);
    } catch (error) {
      setErrorMsg(
        error.response?.data?.error ||
          "Booking failed. Slot might have been just taken.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetBooking = () => {
    setSelectedDoctor(null);
    setSelectedDate("");
    setSlots({ available: [], booked: [], day: "" });
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
          Browse available professionals and book an open time slot instantly.
        </p>
      </div>

      {!selectedDoctor ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor) => (
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
                View Schedule & Book
              </button>
            </div>
          ))}
        </div>
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
                    Slot ({slots.day || "Loading..."})
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
                      {slots.available.map((slot) => (
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
                      {slots.booked.map((slot) => (
                        <button
                          type="button"
                          key={slot}
                          disabled
                          className="py-3 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-gray-400 dark:text-gray-600 font-bold text-sm cursor-not-allowed line-through">
                          {slot}
                        </button>
                      ))}
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
                    <div className="p-3 bg-red-100 text-red-600 rounded-lg text-sm mb-4">
                      {errorMsg}
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
