import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  Plus,
  Loader2,
  CalendarX2,
} from "lucide-react";
import api from "../api/axios";

const DashboardAppointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("Upcoming");

  useEffect(() => {
    const fetchAppointments = async () => {
      setIsLoading(true);
      try {
        // 🔴 FIXED: Changed from "/appointments/patient" to "/patient/appointments"
        const response = await api.get("/patient/appointments");

        // The backend returns { count: x, data: [...] }
        const apiData = response.data.data || response.data;

        if (apiData && apiData.length > 0) {
          setAppointments(apiData);
        } else {
          // Fallback dummy data if database is empty
          setAppointments([
            {
              _id: "1",
              doctor: {
                fullName: "Aisha Rahman",
                specialty: "Consultant Optometrist",
                profilePicture: "https://i.pravatar.cc/150?img=43",
              },
              appointmentDate: new Date(
                Date.now() + 86400000 * 2,
              ).toISOString(),
              time: "10:00 AM",
              type: "Online Video Consult",
              status: "Confirmed",
            },
          ]);
        }
      } catch (error) {
        console.error("Error fetching appointments:", error);
        setAppointments([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  const filteredAppointments = appointments.filter((app) => {
    if (filter === "Upcoming")
      return app.status !== "Completed" && app.status !== "Cancelled";
    else return app.status === "Completed" || app.status === "Cancelled";
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
            Your Appointments
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Manage your upcoming schedules and past consultations.
          </p>
        </div>
        <button
          onClick={() => navigate("/patient-dashboard/book")}
          className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-dark transition-colors flex items-center gap-2 shadow-md shrink-0">
          <Plus className="w-5 h-5" /> Book New
        </button>
      </div>

      <div className="flex gap-4 mb-8 border-b border-gray-200 dark:border-gray-700">
        {["Upcoming", "Past"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`pb-4 px-2 text-sm font-bold transition-all relative ${filter === tab ? "text-primary" : "text-gray-500 dark:text-gray-400"}`}>
            {tab}
            {filter === tab && (
              <span className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full"></span>
            )}
          </button>
        ))}
      </div>

      {filteredAppointments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAppointments.map((appointment) => (
            <div
              key={appointment._id}
              className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <img
                    src={
                      appointment.doctor?.profilePicture ||
                      `https://ui-avatars.com/api/?name=${appointment.doctor?.fullName}`
                    }
                    alt="Doctor"
                    className="w-14 h-14 rounded-full object-cover border-2 border-primary/10"
                  />
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">
                      Dr. {appointment.doctor?.fullName || "Doctor"}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {appointment.doctor?.specialty || "Specialist"}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${appointment.status === "Confirmed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                  {appointment.status}
                </span>
              </div>

              <div className="space-y-4 mb-8 flex-1 bg-gray-50 dark:bg-gray-700/30 p-4 rounded-2xl">
                <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                  <Calendar className="w-5 h-5 text-primary" />
                  <span className="font-medium">
                    {new Date(appointment.appointmentDate).toLocaleDateString()}
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
                {filter === "Upcoming" ? (
                  <button className="flex-1 bg-primary/10 text-primary py-3 rounded-xl font-bold hover:bg-primary hover:text-white transition-colors">
                    {appointment.type?.includes("Video")
                      ? "Join Call"
                      : "View Directions"}
                  </button>
                ) : (
                  <button className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 rounded-xl font-bold">
                    View Summary Notes
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700">
          <CalendarX2 className="w-16 h-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            No {filter.toLowerCase()} appointments
          </h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-8">
            You don't have any {filter.toLowerCase()} schedules right now.
          </p>
          {filter === "Upcoming" && (
            <button
              onClick={() => navigate("/patient-dashboard/book")}
              className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-dark transition-colors">
              Find a Specialist
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default DashboardAppointments;
