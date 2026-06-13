import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  Loader2,
  CalendarX2,
  Check,
  X,
  User,
} from "lucide-react";
import api from "../api/axios";

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("Upcoming");
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/provider/appointments");
      const appointmentsData = response.data?.data || response.data || [];

      if (appointmentsData.length > 0) {
        setAppointments(appointmentsData);
      } else {
        loadFallbackData();
      }
    } catch (error) {
      console.error("Error fetching appointments, using fallback:", error);
      loadFallbackData();
    } finally {
      setIsLoading(false);
    }
  };

  const loadFallbackData = () => {
    setAppointments([
      {
        _id: "1",
        patient: {
          fullName: "Aisha",
          profilePicture: "https://i.pravatar.cc/150?img=5",
        },
        appointmentDate: new Date(Date.now() + 86400000 * 2).toISOString(),
        time: "10:00 AM",
        type: "Online Video Consult",
        status: "Confirmed",
      },
      {
        _id: "2",
        patient: {
          fullName: "Samuel Johnson",
          profilePicture: "https://i.pravatar.cc/150?img=11",
        },
        appointmentDate: new Date(Date.now() + 86400000 * 3).toISOString(),
        time: "02:30 PM",
        type: "In-Person Clinic Visit",
        status: "Pending",
      },
    ]);
  };

  // 🔴 REAL API CALL FOR STATUS UPDATES
  const handleStatusUpdate = async (id, newStatus) => {
    setActionLoading(id);
    try {
      // Map UI status to backend expected action
      const apiAction =
        newStatus === "Confirmed"
          ? "accept"
          : newStatus === "Completed"
            ? "complete"
            : "decline";

      await api.patch(`/provider/appointments/${id}/respond`, {
        action: apiAction,
      });

      // Update local state instantly for UI responsiveness
      setAppointments((prev) =>
        prev.map((apt) =>
          apt._id === id ? { ...apt, status: newStatus } : apt,
        ),
      );
    } catch (error) {
      console.error("Failed to update appointment status:", error);
      alert("Failed to update status. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredAppointments = appointments.filter((app) => {
    if (filter === "Upcoming") return app.status === "confirmed";
    if (filter === "Pending") return app.status === "pending";
    return (
      app.status === "completed" ||
      app.status === "cancelled" ||
      app.status === "declined"
    );
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Schedule & Appointments
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Manage your bookings, review requests, and join consultations.
          </p>
        </div>
      </div>

      <div className="flex gap-4 mb-8 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        {["Upcoming", "Pending", "Past"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`pb-4 px-2 text-sm font-bold transition-all relative whitespace-nowrap ${filter === tab ? "text-primary" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"}`}>
            {tab}
            {tab === "Pending" &&
              appointments.some((a) => a.status === "pending") && (
                <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                  {appointments.filter((a) => a.status === "pending").length}
                </span>
              )}
            {filter === tab && (
              <span className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full"></span>
            )}
          </button>
        ))}
      </div>

      {filteredAppointments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAppointments.map((appointment) => {
            const patientName =
              appointment.patient?.fullName ||
              appointment.patientName ||
              "Patient";
            const patientImage =
              appointment.patient?.profilePicture ||
              `https://ui-avatars.com/api/?name=${patientName}`;

            return (
              <div
                key={appointment._id}
                className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <img
                      src={patientImage}
                      alt="Patient"
                      className="w-14 h-14 rounded-full object-cover border-2 border-primary/10"
                    />
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white">
                        {patientName}
                      </h4>
                      <button className="text-xs text-primary font-medium hover:underline flex items-center gap-1 mt-1">
                        <User className="w-3 h-3" /> View Records
                      </button>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      appointment.status === "confirmed"
                        ? "bg-green-100 text-green-700 dark:bg-green-500/10"
                        : appointment.status === "pending"
                          ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10"
                          : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                    }`}>
                    {appointment.status.charAt(0).toUpperCase() +
                      appointment.status.slice(1)}
                  </span>
                </div>

                <div className="space-y-4 mb-8 flex-1 bg-gray-50 dark:bg-gray-700/30 p-4 rounded-2xl">
                  <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                    <Calendar className="w-5 h-5 text-primary" />
                    <span className="font-medium">
                      {new Date(appointment.appointmentDate).toLocaleDateString(
                        undefined,
                        {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        },
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                    <Clock className="w-5 h-5 text-primary" />
                    <span className="font-medium">{appointment.time}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                    {appointment.type?.includes("Video") ? (
                      <Video className="w-5 h-5 text-primary" />
                    ) : (
                      <MapPin className="w-5 h-5 text-primary" />
                    )}
                    <span className="font-medium">{appointment.type}</span>
                  </div>
                </div>

                <div className="flex gap-3 mt-auto">
                  {appointment.status === "pending" ? (
                    <>
                      <button
                        onClick={() =>
                          handleStatusUpdate(appointment._id, "Confirmed")
                        }
                        disabled={actionLoading === appointment._id}
                        className="flex-1 bg-green-500 text-white py-3 rounded-xl font-bold hover:bg-green-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-70">
                        {actionLoading === appointment._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Check className="w-4 h-4" /> Accept
                          </>
                        )}
                      </button>
                      <button
                        onClick={() =>
                          handleStatusUpdate(appointment._id, "Declined")
                        }
                        disabled={actionLoading === appointment._id}
                        className="flex-1 bg-red-100 text-red-600 dark:bg-red-500/10 py-3 rounded-xl font-bold hover:bg-red-200 dark:hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2 disabled:opacity-70">
                        <X className="w-4 h-4" /> Decline
                      </button>
                    </>
                  ) : appointment.status === "confirmed" ? (
                    <>
                      <button
                        onClick={() =>
                          handleStatusUpdate(appointment._id, "Completed")
                        }
                        disabled={actionLoading === appointment._id}
                        className="flex-1 bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary-dark transition-colors flex items-center justify-center gap-2 disabled:opacity-70">
                        {actionLoading === appointment._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Check className="w-4 h-4" /> Mark as Complete
                          </>
                        )}
                      </button>
                      <button
                        onClick={() =>
                          handleStatusUpdate(appointment._id, "Cancelled")
                        }
                        disabled={actionLoading === appointment._id}
                        className="px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium disabled:opacity-70">
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                      View Clinical Notes
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700">
          <div className="w-20 h-20 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6">
            <CalendarX2 className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            No {filter.toLowerCase()} appointments
          </h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-sm">
            You don't have any {filter.toLowerCase()} schedules matching this
            status.
          </p>
        </div>
      )}
    </div>
  );
};

export default DoctorAppointments;
