import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import NotificationBell from "../components/NotificationBell"; // (or "../components/NotificationBell" depending on folder)
import {
  Clock,
  Bell,
  Calendar,
  Activity,
  Loader2,
  Menu,
  Users,
  ChevronRight,
} from "lucide-react";
import api from "../api/axios";
import DoctorSidebar from "../doctorscomponent/DoctorSidebar";
import DoctorAppointments from "../doctorscomponent/DoctorAppointments";
import DoctorPatients from "../doctorscomponent/DoctorPatients";
import DoctorTriage from "../doctorscomponent/DoctorTriage";

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const { tab } = useParams();
  const activeTab = tab || "overview";
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [doctor, setDoctor] = useState({
    name: "Loading...",
    specialty: "Specialist",
    avatar:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=150&h=150&fit=crop",
  });
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [pendingTriage, setPendingTriage] = useState([]);
  const [stats, setStats] = useState({
    totalPatients: 0,
    appointmentsToday: 0,
  });

  useEffect(() => {
    const fetchDoctorData = async () => {
      try {
        setIsLoading(true);
        const profileRes = await api.get("/profile/me");
        if (profileRes.data && profileRes.data.data) {
          setDoctor({
            name: profileRes.data.data.fullName || "Dr. Specialist",
            specialty: profileRes.data.data.speciality || "Optometrist",
            avatar: profileRes.data.data.profilePicture || doctor.avatar,
          });
        }
        const aptRes = await api.get("/provider/appointments");
        if (aptRes.data && aptRes.data.data && aptRes.data.data.length > 0) {
          setTodayAppointments(aptRes.data.data.slice(0, 3));
          setStats((prev) => ({
            ...prev,
            appointmentsToday: aptRes.data.data.length,
          }));
        } else {
          setTodayAppointments([
            {
              _id: "1",
              patient: { fullName: "Aisha" },
              time: "10:00 AM",
              type: "Video Consult",
              status: "Confirmed",
            },
            {
              _id: "2",
              patient: { fullName: "Samuel" },
              time: "01:30 PM",
              type: "In-Person",
              status: "Pending",
            },
          ]);
          setStats((prev) => ({ ...prev, appointmentsToday: 2 }));
        }
        const triageRes = await api.get("/provider/triage");
        if (triageRes.data && triageRes.data.length > 0) {
          setPendingTriage(triageRes.data.slice(0, 3));
        } else {
          setPendingTriage([
            {
              _id: "t1",
              patientName: "Anonymous Patient",
              symptom: "Severe Eye Pain",
              severity: 8,
              timeAgo: "2 hours ago",
            },
          ]);
        }
        setStats((prev) => ({ ...prev, totalPatients: 142 }));
      } catch (error) {
        console.error("Backend not fully connected yet, using fallback data.");
        setDoctor((prev) => ({ ...prev, name: "Dr. Specialist" }));
        setTodayAppointments([
          {
            _id: "1",
            patientName: "Aisha",
            time: "10:00 AM",
            type: "Video Consult",
            status: "Confirmed",
          },
          {
            _id: "2",
            patientName: "Samuel",
            time: "01:30 PM",
            type: "In-Person",
            status: "Pending",
          },
        ]);
        setPendingTriage([
          {
            _id: "t1",
            patientName: "Anonymous Patient",
            symptom: "Severe Eye Pain",
            severity: 8,
            timeAgo: "2 hours ago",
          },
        ]);
        setStats({ totalPatients: 142, appointmentsToday: 2 });
      } finally {
        setIsLoading(false);
      }
    };
    fetchDoctorData();
  }, []);

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );

  return (
    <div className="h-screen flex bg-gray-50 dark:bg-gray-900 transition-colors duration-300 overflow-hidden">
      <DoctorSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 md:px-8 py-4 flex justify-between items-center z-10 shrink-0 transition-colors duration-300">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden text-gray-500 hover:text-primary transition-colors p-1">
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white capitalize">
              {activeTab.replace("-", " ")}
            </h1>
          </div>
          <div className="flex items-center gap-4 md:gap-6">
            <NotificationBell />
            <div
              onClick={() => navigate("/doctor-dashboard/profile")}
              className="flex items-center gap-3 pl-4 md:pl-6 border-l border-gray-200 dark:border-gray-700 cursor-pointer hover:opacity-75 transition-opacity">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {doctor.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {doctor.specialty}
                </p>
              </div>
              <img
                src={doctor.avatar}
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-primary text-white rounded-3xl p-6 relative overflow-hidden shadow-lg shadow-primary/20">
                    <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                    <div className="relative z-10">
                      <p className="text-primary-light font-medium mb-1">
                        Today's Appointments
                      </p>
                      <h3 className="text-4xl font-bold">
                        {stats.appointmentsToday}
                      </h3>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 font-medium mb-1">
                        Total Patients
                      </p>
                      <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {stats.totalPatients}
                      </h3>
                    </div>
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 font-medium mb-1">
                        Pending Triage
                      </p>
                      <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {pendingTriage.length}
                      </h3>
                    </div>
                    <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                      <Activity className="w-6 h-6 text-red-500" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        Today's Schedule
                      </h3>
                      <button
                        onClick={() =>
                          navigate("/doctor-dashboard/appointments")
                        }
                        className="text-sm font-medium text-primary hover:text-primary-dark flex items-center">
                        View Calendar <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="space-y-4">
                      {todayAppointments.map((apt) => {
                        // 🔴 FIX: Safely extract the patient's name from either the backend populated object or the fallback dummy data
                        const patientName =
                          apt.patient?.fullName || apt.patientName || "Patient";
                        return (
                          <div
                            key={apt._id}
                            className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold">
                                {patientName.charAt(0)}
                              </div>
                              <div>
                                <h4 className="font-bold text-gray-900 dark:text-white">
                                  {patientName}
                                </h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />{" "}
                                  {apt.time || "Time TBD"} •{" "}
                                  {apt.type || "Consultation"}
                                </p>
                              </div>
                            </div>
                            <button className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary-dark transition-colors">
                              Join
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        Wadi Triage Alerts
                      </h3>
                      <button
                        onClick={() =>
                          navigate("/doctor-dashboard/wadi-triage")
                        }
                        className="text-sm font-medium text-primary hover:text-primary-dark flex items-center">
                        Review All <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="space-y-4">
                      {pendingTriage.map((triage) => (
                        <div
                          key={triage._id}
                          className="p-4 rounded-2xl border border-gray-100 dark:border-gray-600 hover:border-primary/50 transition-colors cursor-pointer group">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                              {triage.symptom}
                            </h4>
                            <span
                              className={`px-2 py-1 rounded text-xs font-bold ${triage.severity >= 7 ? "bg-red-100 text-red-600 dark:bg-red-500/10" : "bg-yellow-100 text-yellow-600 dark:bg-yellow-500/10"}`}>
                              Severity: {triage.severity}/10
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                            <span>
                              {triage.patient?.fullName ||
                                triage.patientName ||
                                "Anonymous"}
                            </span>
                            <span>{triage.timeAgo || "Recently"}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "appointments" && <DoctorAppointments />}
            {activeTab === "patients" && <DoctorPatients />}
            {activeTab === "wadi-triage" && <DoctorTriage />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DoctorDashboard;
