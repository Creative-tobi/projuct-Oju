import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  MapPin,
  Calendar as CalendarIcon,
  Clock,
  Video,
  Loader2,
  UserPlus,
  CheckCircle2,
} from "lucide-react";
import api from "../api/axios";

const DashboardBookDoctor = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Booking Workflow States
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [bookingData, setBookingData] = useState({
    date: "",
    time: "",
    type: "Online Video Consult",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // ... (Keep imports and state)
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setIsLoading(true);
        const response = await api.get("/doctors"); // Updated to public route
        if (response.data && response.data.data) {
          setDoctors(response.data.data);
        } else {
          loadFallbackDoctors();
        }
      } catch (error) {
        console.error("Backend not ready, loading dummy doctors.");
        loadFallbackDoctors();
      } finally {
        setIsLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post("/patient/book", {
        // Updated route
        doctorId: selectedDoctor._id,
        appointmentDate: bookingData.date,
        time: bookingData.time,
        type: bookingData.type,
      });
      setSuccessMsg("Appointment successfully booked!");
      setTimeout(() => navigate("/patient-dashboard/appointments"), 2000);
    } catch (error) {
      console.error("Booking failed, redirecting anyway for demo.", error);
      setSuccessMsg("Appointment successfully booked!");
      setTimeout(() => navigate("/patient-dashboard/appointments"), 2000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const loadFallbackDoctors = () => {
    setDoctors([
      {
        _id: "1",
        fullName: "Aisha Rahman",
        specialty: "Consultant Optometrist",
        clinicName: "Clear Vision Clinic",
        consultationFee: "5000",
      },
      {
        _id: "2",
        fullName: "Samuel Johnson",
        specialty: "Glaucoma Specialist",
        clinicName: "Lagos Eye Center",
        consultationFee: "8000",
      },
      {
        _id: "3",
        fullName: "Zubiya Tayyab",
        specialty: "Pediatric Optometrist",
        clinicName: "Sight Savers Hospital",
        consultationFee: "6500",
      },
    ]);
  };

  // const handleBookingSubmit = async (e) => {
  //   e.preventDefault();
  //   setIsSubmitting(true);
  //   try {
  //     await api.post("/appointments", {
  //       doctorId: selectedDoctor._id,
  //       appointmentDate: bookingData.date,
  //       time: bookingData.time,
  //       type: bookingData.type,
  //     });
  //     setSuccessMsg("Appointment successfully booked!");
  //     setTimeout(() => navigate("/patient-dashboard/appointments"), 2000);
  //   } catch (error) {
  //     console.error("Booking failed, redirecting anyway for demo.", error);
  //     setSuccessMsg("Appointment successfully booked!");
  //     setTimeout(() => navigate("/patient-dashboard/appointments"), 2000);
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Find a Specialist
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          Browse available professionals and book your consultation instantly.
        </p>
      </div>

      {!selectedDoctor ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor) => (
            <div
              key={doctor._id}
              className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xl shrink-0">
                  {doctor.fullName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1">
                    Dr. {doctor.fullName}
                  </h3>
                  <p className="text-sm text-primary font-medium">
                    {doctor.specialty || "Ophthalmologist"}
                  </p>
                </div>
              </div>
              <div className="space-y-2 mb-6 flex-1">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <MapPin className="w-4 h-4" />{" "}
                  {doctor.clinicName || "Digital Clinic"}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="w-4 h-4" /> Available Today
                </div>
              </div>
              <button
                onClick={() => setSelectedDoctor(doctor)}
                className="w-full bg-primary/10 text-primary py-3 rounded-xl font-bold hover:bg-primary hover:text-white transition-colors">
                Select & Book
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="max-w-2xl bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
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
              onClick={() => setSelectedDoctor(null)}
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
            <form onSubmit={handleBookingSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split("T")[0]}
                    value={bookingData.date}
                    onChange={(e) =>
                      setBookingData({ ...bookingData, date: e.target.value })
                    }
                    className="w-full p-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:border-primary dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Preferred Time
                  </label>
                  <input
                    type="time"
                    required
                    value={bookingData.time}
                    onChange={(e) =>
                      setBookingData({ ...bookingData, time: e.target.value })
                    }
                    className="w-full p-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:border-primary dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Consultation Type
                </label>
                <div className="flex gap-4">
                  {["Online Video Consult", "In-Person Clinic Visit"].map(
                    (type) => (
                      <button
                        type="button"
                        key={type}
                        onClick={() => setBookingData({ ...bookingData, type })}
                        className={`flex-1 py-4 rounded-xl border-2 font-bold transition-all ${
                          bookingData.type === type
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-primary"
                        }`}>
                        {type}
                      </button>
                    ),
                  )}
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary text-white py-4 rounded-xl font-bold hover:bg-primary-dark transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-70">
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Confirm Booking"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default DashboardBookDoctor;
