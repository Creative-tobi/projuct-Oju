import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  MapPin,
  Calendar as CalendarIcon,
  Clock,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Star,
  Building,
  Award,
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
  const [isBooking, setIsBooking] = useState(false); // Controls Details View vs Booking Form
  const [selectedDate, setSelectedDate] = useState("");
  const [slotsData, setSlotsData] = useState({
    available: [],
    booked: [],
    all: [],
  });
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState("");

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

  // Fetch Slots when Date Changes
  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      const fetchSlots = async () => {
        setIsLoadingSlots(true);
        setSlotsData({ available: [], booked: [], all: [] });
        setSelectedSlot("");
        setErrorMsg("");
        try {
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
        experience: "12",
        qualifications: "MBBS, FWACS",
      },
      {
        _id: "2",
        fullName: "Samuel Johnson",
        speciality: "Glaucoma Specialist",
        clinicName: "Lagos Eye Center",
        consultationFee: "8000",
        experience: "15",
        qualifications: "MD, FACS",
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
    try {
      // 🔴 FIXED: Sends 'specialist' instead of 'doctorId', hardcoded to In-Person
      await api.post("/patient/book", {
        specialist: selectedDoctor._id,
        appointmentDate: selectedDate,
        time: selectedSlot,
        type: "In-Person Clinic Visit",
      });

      setSuccessMsg("Appointment successfully booked!");
      setTimeout(() => navigate("/patient-dashboard/appointments"), 2500);
    } catch (error) {
      setErrorMsg(
        error.response?.data?.error ||
          "Booking failed. Slot might have just been taken.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetBooking = () => {
    setSelectedDoctor(null);
    setIsBooking(false);
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
          Browse our network of verified professionals and schedule an in-person
          clinic visit.
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
                    View Clinic & Book
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
      ) : !isBooking ? (
        // 🔴 DOCTOR DETAILS VIEW (Shown before booking)
        <div className="max-w-4xl bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm animate-fade-in-up">
          <button
            onClick={() => setSelectedDoctor(null)}
            className="text-gray-400 hover:text-primary font-medium mb-6 flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Specialists
          </button>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/3 flex flex-col items-center md:items-start">
              <img
                src={
                  selectedDoctor.profilePicture ||
                  `https://ui-avatars.com/api/?name=${selectedDoctor.fullName}`
                }
                alt={selectedDoctor.fullName}
                className="w-32 h-32 rounded-2xl object-cover border-4 border-primary/10 mb-4"
              />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center md:text-left">
                Dr. {selectedDoctor.fullName}
              </h2>
              <p className="text-primary font-semibold text-center md:text-left">
                {selectedDoctor.speciality || "Ophthalmologist"}
              </p>
              <div className="flex items-center gap-1 mt-2 text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
            </div>
            <div className="flex-1 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-100 dark:border-gray-600">
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold">
                    Experience
                  </p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {selectedDoctor.experience || "5"}+ Years
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-100 dark:border-gray-600">
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold">
                    Consultation Fee
                  </p>
                  <p className="text-lg font-bold text-primary">
                    ₦{selectedDoctor.consultationFee || "5000"}
                  </p>
                </div>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <Building className="w-5 h-5 text-primary" /> Clinic Location
                </h4>
                <p className="text-gray-600 dark:text-gray-300">
                  {selectedDoctor.clinicName || "Oju Vision Care Clinic"}
                </p>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" /> Qualifications
                </h4>
                <p className="text-gray-600 dark:text-gray-300">
                  {selectedDoctor.qualifications ||
                    "Board Certified in Ophthalmology and Optometry"}
                </p>
              </div>
              <button
                onClick={() => setIsBooking(true)}
                className="w-full bg-primary text-white py-4 rounded-xl font-bold hover:bg-primary-dark transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/30 mt-6">
                Schedule In-Person Visit{" "}
                <ArrowLeft className="w-5 h-5 rotate-180" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        // 🔴 BOOKING FORM WITH DYNAMIC SLOTS
        <div className="max-w-4xl bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex justify-between items-center mb-8 border-b border-gray-100 dark:border-gray-700 pb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Schedule Clinic Visit
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                with Dr. {selectedDoctor.fullName} at{" "}
                {selectedDoctor.clinicName}
              </p>
            </div>
            <button
              onClick={() => setIsBooking(false)}
              className="text-gray-400 hover:text-primary font-medium">
              Back to Profile
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
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-xl mb-6 flex items-start gap-3">
                    <MapPin className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">In-Person Visit Confirmed</p>
                      <p className="text-sm opacity-90">
                        Please arrive at{" "}
                        <strong>{selectedDoctor.clinicName}</strong> 10 minutes
                        before your scheduled time.
                      </p>
                    </div>
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
                      `Confirm Clinic Visit for ${selectedSlot}`
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
