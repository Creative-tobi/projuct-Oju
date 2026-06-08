import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Plus,
  Clock,
  ChevronRight,
  Bell,
  Calendar,
  Activity,
  Loader2,
  Menu,
} from "lucide-react";
import api from "../api/axios";

import Sidebar from "../components/Sidebar";
import DashboardWadi from "../components/DashboardWadi";
import DashboardAppointments from "../components/DashboardAppointments";
import DashboardRecords from "../components/DashboardRecords";
import DashboardBookDoctor from "../components/DashboardBookDoctor";

const PatientDashboard = () => {
  const navigate = useNavigate();
  const { tab } = useParams();
  const activeTab = tab || "overview";

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState({
    name: "Loading...",
    email: "",
    avatar:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=150&h=150&fit=crop",
  });
  const [upcomingAppointment, setUpcomingAppointment] = useState(null);
  const [recentAssessments, setRecentAssessments] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const profileRes = await api.get("/profile/me"); // Updated route
        if (profileRes.data && profileRes.data.data) {
          setUser({
            name: profileRes.data.data.fullName || "Patient",
            email: profileRes.data.data.email || "",
            avatar:
              profileRes.data.data.profilePicture ||
              profileRes.data.data.avatar ||
              user.avatar,
          });
        }
        const aptRes = await api.get("/patient/appointments"); // Updated route
        if (aptRes.data && aptRes.data.data && aptRes.data.data.length > 0) {
          setUpcomingAppointment(aptRes.data.data[0]);
        } else {
          setUpcomingAppointment({
            doctor: "Dr. Aisha Rahman",
            specialty: "Consultant Optometrist",
            date: "June 12, 2026",
            time: "10:00 AM",
            type: "Online Video Consult",
            image: "https://i.pravatar.cc/150?img=43",
          });
        }
        const assessmentRes = await api.get("/patient/assessment/history"); // Updated route
        if (
          assessmentRes.data &&
          assessmentRes.data.data &&
          assessmentRes.data.data.length > 0
        ) {
          setRecentAssessments(assessmentRes.data.data);
        } else {
          setRecentAssessments([
            {
              _id: 1,
              date: "June 2, 2026",
              symptom: "Blurry Vision",
              severity: "High",
              status: "Consultation Booked",
            },
          ]);
        }
      } catch (error) {
        console.error("Backend not fully connected yet, using fallback data.");
        setUser((prev) => ({ ...prev, name: "Patient" }));
        setUpcomingAppointment({
          doctor: "Dr. Aisha Rahman",
          specialty: "Consultant Optometrist",
          date: "June 12, 2026",
          time: "10:00 AM",
          type: "Online Video Consult",
          image: "https://i.pravatar.cc/150?img=43",
        });
        setRecentAssessments([
          {
            _id: 1,
            date: "June 2, 2026",
            symptom: "Blurry Vision",
            severity: "High",
            status: "Consultation Booked",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );

  return (
    <div className="h-screen flex bg-gray-50 dark:bg-gray-900 transition-colors duration-300 overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 md:px-8 py-4 flex justify-between items-center z-10 shrink-0 transition-colors duration-300">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden text-gray-500 hover:text-primary transition-colors p-1">
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white capitalize">
              {activeTab === "assessment"
                ? "Patient Assessment"
                : activeTab === "book"
                  ? "Book Specialist"
                  : activeTab}
            </h1>
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            <button className="text-gray-400 hover:text-primary transition-colors relative">
              <Bell className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-800"></span>
            </button>
            <div
              onClick={() => navigate("/profile")}
              className="flex items-center gap-3 pl-4 md:pl-6 border-l border-gray-200 dark:border-gray-700 cursor-pointer hover:opacity-75 transition-opacity">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Patient
                </p>
              </div>
              <img
                src={user.avatar}
                alt="Profile"
                className="w-10 h-10 rounded-full border-2 border-primary/20 object-cover"
              />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto space-y-8">
            {activeTab === "overview" && (
              <div className="space-y-8 animate-fade-in-up">
                <div className="bg-primary-dark rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-lg shadow-primary/20">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary rounded-full opacity-50 blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                  <div className="relative z-10">
                    <h2 className="text-2xl md:text-3xl font-bold mb-2">
                      Good afternoon, {user.name}!
                    </h2>
                    <p className="text-primary-light mb-8 max-w-md">
                      Your vision health is on track. You have one upcoming
                      appointment scheduled.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <button
                        onClick={() =>
                          navigate("/patient-dashboard/assessment")
                        }
                        className="bg-white text-primary-dark px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 shadow-md w-full sm:w-auto">
                        <Activity className="w-5 h-5" /> New Assessment
                      </button>
                      <button
                        onClick={() => navigate("/patient-dashboard/book")}
                        className="bg-primary text-white border border-white/20 px-6 py-3 rounded-xl font-bold hover:bg-primary-light/20 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto">
                        <Plus className="w-5 h-5" /> Book Doctor
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm transition-colors duration-300">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        Next Appointment
                      </h3>
                      <button
                        onClick={() =>
                          navigate("/patient-dashboard/appointments")
                        }
                        className="text-sm font-medium text-primary hover:text-primary-dark">
                        View All
                      </button>
                    </div>
                    {upcomingAppointment && (
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-5 border border-gray-100 dark:border-gray-600">
                        <div className="flex items-center gap-4 mb-4">
                          <img
                            src={
                              upcomingAppointment.image ||
                              "https://ui-avatars.com/api/?name=" +
                                upcomingAppointment.doctor
                            }
                            alt="Doctor"
                            className="w-12 h-12 rounded-full object-cover shrink-0"
                          />
                          <div className="min-w-0">
                            <h4 className="font-bold text-gray-900 dark:text-white truncate">
                              {upcomingAppointment.doctor}
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                              {upcomingAppointment.specialty}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-600">
                          <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                            <Calendar className="w-4 h-4 text-primary shrink-0" />{" "}
                            {upcomingAppointment.date}
                          </div>
                          <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                            <Clock className="w-4 h-4 text-primary shrink-0" />{" "}
                            {upcomingAppointment.time}
                          </div>
                        </div>
                        <button className="w-full mt-6 bg-primary/10 text-primary py-2.5 rounded-xl font-bold hover:bg-primary hover:text-white transition-all duration-300">
                          Join Call
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm transition-colors duration-300 overflow-hidden flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        Recent Assessments
                      </h3>
                      <button
                        onClick={() => navigate("/patient-dashboard/records")}
                        className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-primary flex items-center gap-1">
                        View All <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="overflow-x-auto -mx-6 px-6 sm:mx-0 sm:px-0">
                      <table className="w-full text-left border-collapse min-w-[500px]">
                        <thead>
                          <tr className="text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                            <th className="pb-3 font-medium whitespace-nowrap">
                              Date
                            </th>
                            <th className="pb-3 font-medium whitespace-nowrap">
                              Primary Symptom
                            </th>
                            <th className="pb-3 font-medium whitespace-nowrap">
                              Severity
                            </th>
                          </tr>
                        </thead>
                        <tbody className="text-sm">
                          {recentAssessments.map((assessment) => (
                            <tr
                              key={assessment._id}
                              className="border-b border-gray-50 dark:border-gray-700/50">
                              <td className="py-4 text-gray-900 dark:text-white whitespace-nowrap">
                                {assessment.date}
                              </td>
                              <td className="py-4 text-gray-900 dark:text-white font-medium whitespace-nowrap">
                                {assessment.symptom}
                              </td>
                              <td className="py-4 whitespace-nowrap">
                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-600 dark:bg-yellow-500/10">
                                  {assessment.severity}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "book" && <DashboardBookDoctor />}
            {activeTab === "appointments" && <DashboardAppointments />}
            {activeTab === "assessment" && <DashboardWadi />}
            {activeTab === "records" && <DashboardRecords />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PatientDashboard;
