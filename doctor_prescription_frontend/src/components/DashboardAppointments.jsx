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
        const response = await api.get("/patient/appointments");
        const apiData = response.data?.data || response.data || [];

        if (apiData.length > 0) {
          setAppointments(apiData);
        } else {
          setAppointments([
            {
              _id: "1",
              specialist: {
                fullName: "Aisha Rahman",
                speciality: "Consultant Optometrist",
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
            className={`pb-4 px-2 text-sm font-bold transition-all relative ${filter === tab ? "text-primary" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"}`}>
            {tab}
            {filter === tab && (
              <span className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full"></span>
            )}
          </button>
        ))}
      </div>

      {filteredAppointments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAppointments.map((appointment) => {
            // 🔴 FIXED: Safely map backend 'specialist' data to frontend variables
            const doctorName =
              appointment.specialist?.fullName ||
              appointment.doctor?.fullName ||
              "Doctor";
            const doctorSpecialty =
              appointment.specialist?.speciality ||
              appointment.doctor?.specialty ||
              "Specialist";
            const doctorImage =
              appointment.specialist?.profilePicture ||
              appointment.doctor?.profilePicture ||
              `https://ui-avatars.com/api/?name=${doctorName}`;

            return (
              <div
                key={appointment._id}
                className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <img
                      src={doctorImage}
                      alt="Doctor"
                      className="w-14 h-14 rounded-full object-cover border-2 border-primary/10"
                    />
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white">
                        Dr. {doctorName}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {doctorSpecialty}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${appointment.status === "Confirmed" ? "bg-green-100 text-green-700 dark:bg-green-500/10" : "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10"}`}>
                    {appointment.status}
                  </span>
                </div>

                <div className="space-y-4 mb-8 flex-1 bg-gray-50 dark:bg-gray-700/30 p-4 rounded-2xl">
                  <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                    <Calendar className="w-5 h-5 text-primary" />
                    <span className="font-medium">
                      {new Date(appointment.appointmentDate).toLocaleDateString(
                        undefined,
                        {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
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
                    <MapPin className="w-5 h-5 text-primary" />
                    <span className="font-medium">In-Person Clinic Visit</span>
                  </div>
                </div>

                <div className="flex gap-3 mt-auto">
                  {filter === "Upcoming" ? (
                    <>
                      <button className="flex-1 bg-primary/10 text-primary py-3 rounded-xl font-bold hover:bg-primary hover:text-white transition-colors flex items-center justify-center gap-2">
                        <MapPin className="w-4 h-4" /> View Clinic Details
                      </button>
                      <button className="px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium">
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                      View Summary Notes
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
          <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-8">
            You don't have any {filter.toLowerCase()} schedules in your calendar
            right now.
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
