import React, { useState, useEffect } from "react";
import { Search, Mail, Phone, Calendar, Activity, Pill, FileText, Loader2, X, Users } from "lucide-react";
import api from "../api/axios";

const DoctorPatients = () => {
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modal States
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [patientHistory, setPatientHistory] = useState({ assessments: [], appointments: [] });

  useEffect(() => {
    const fetchPatients = async () => {
      setIsLoading(true);
      try {
        const response = await api.get("/provider/patients");
        if (response.data && response.data.length > 0) {
          setPatients(response.data);
        } else {
          loadFallbackPatients();
        }
      } catch (error) {
        console.error("Error fetching patients, using fallback:", error);
        loadFallbackPatients();
      } finally {
        setIsLoading(false);
      }
    };
    fetchPatients();
  }, []);

  const loadFallbackPatients = () => {
    setPatients([
      { _id: "p1", fullName: "Olasunkanmi", email: "ola@example.com", phone: "+234 800 123 4567", dob: "1998-05-14", gender: "Male", profilePicture: "https://i.pravatar.cc/150?img=12", lastVisit: new Date(Date.now() - 86400000 * 5).toISOString() },
      { _id: "p2", fullName: "Aisha Bello", email: "aisha.b@example.com", phone: "+234 801 987 6543", dob: "1995-11-22", gender: "Female", profilePicture: "https://i.pravatar.cc/150?img=5", lastVisit: new Date(Date.now() - 86400000 * 12).toISOString() },
    ]);
  };

  // 🔴 REAL API CALL FOR PATIENT HISTORY
  const handleViewHistory = async (patient) => {
    setSelectedPatient(patient);
    setHistoryLoading(true);
    try {
      const res = await api.get(`/provider/patients/${patient._id}/history`);
      setPatientHistory({
        assessments: res.data.assessments || [],
        appointments: res.data.appointments || [],
      });
    } catch (error) {
      console.error("Could not fetch history:", error);
      setPatientHistory({ assessments: [], appointments: [] });
    } finally {
      setHistoryLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedPatient(null);
    setPatientHistory({ assessments: [], appointments: [] });
  };

  const filteredPatients = patients.filter((p) =>
    p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[50vh]"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;
  }

  return (
    <div className="animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Patient Directory</h2>
          <p className="text-gray-500 dark:text-gray-400">Search and manage your patient roster and clinical records.</p>
        </div>
        <div className="w-full md:w-auto relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search patients by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-80 pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:border-primary text-gray-900 dark:text-white transition-colors shadow-sm"
          />
        </div>
      </div>

      {filteredPatients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPatients.map((patient) => (
            <div key={patient._id} className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <img src={patient.profilePicture || `https://ui-avatars.com/api/?name=${patient.fullName}`} alt={patient.fullName} className="w-16 h-16 rounded-full object-cover border-2 border-primary/20" />
                <div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-1">{patient.fullName}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{patient.gender} • {new Date().getFullYear() - new Date(patient.dob).getFullYear()} yrs</p>
                </div>
              </div>
              <div className="space-y-3 mb-6 bg-gray-50 dark:bg-gray-700/30 p-4 rounded-2xl border border-gray-100 dark:border-gray-600">
                <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                  <Mail className="w-4 h-4 text-primary shrink-0" /> <span className="truncate">{patient.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                  <Phone className="w-4 h-4 text-primary shrink-0" /> <span>{patient.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                  <Calendar className="w-4 h-4 text-primary shrink-0" /> <span>Last visit: {new Date(patient.lastVisit).toLocaleDateString()}</span>
                </div>
              </div>
              <button onClick={() => handleViewHistory(patient)} className="w-full bg-primary/10 text-primary py-3 rounded-xl font-bold hover:bg-primary hover:text-white transition-colors flex items-center justify-center gap-2">
                <FileText className="w-4 h-4" /> View Clinical History
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700">
          <div className="w-20 h-20 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6"><Users className="w-10 h-10 text-gray-400" /></div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No patients found</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-sm">We couldn't find any patients matching your search criteria.</p>
        </div>
      )}

      {/* Patient Medical History Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in-up">
          <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/80">
              <div className="flex items-center gap-4">
                <img src={selectedPatient.profilePicture} alt={selectedPatient.fullName} className="w-12 h-12 rounded-full object-cover border-2 border-primary/20" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{selectedPatient.fullName}'s Records</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Complete Clinical History</p>
                </div>
              </div>
              <button onClick={closeModal} className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {historyLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 font-medium">Pulling secure records...</p>
                </div>
              ) : (
                <>
                  {/* Wadi Assessments Section */}
                  <section>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Activity className="w-5 h-5 text-primary" /> Past Wadi Assessments</h4>
                    {patientHistory.assessments.length > 0 ? (
                      <div className="space-y-4">
                        {patientHistory.assessments.map((assessment) => (
                          <div key={assessment._id} className="bg-gray-50 dark:bg-gray-700/30 p-5 rounded-2xl border border-gray-100 dark:border-gray-600">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <p className="font-bold text-gray-900 dark:text-white">{assessment.primarySymptoms}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(assessment.createdAt).toLocaleDateString()}</p>
                              </div>
                              <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">
                                Sev: {assessment.investigationAnswers?.find(a => a.question === "Severity")?.answer || "N/A"}/10
                              </span>
                            </div>
                            {assessment.investigationAnswers && (
                              <p className="text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
                                <strong className="text-primary mr-1">Clinical Notes:</strong> {assessment.investigationAnswers.find(a => a.question === "Medical Context")?.answer || "No notes provided."}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400 italic bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl">No previous Wadi assessments on record.</p>
                    )}
                  </section>

                  {/* Completed Appointments Section */}
                  <section>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Calendar className="w-5 h-5 text-primary" /> Past Appointments</h4>
                    {patientHistory.appointments.length > 0 ? (
                      <div className="space-y-4">
                        {patientHistory.appointments.map((apt) => (
                          <div key={apt._id} className="bg-gray-50 dark:bg-gray-700/30 p-5 rounded-2xl border border-gray-100 dark:border-gray-600 flex justify-between items-center">
                            <div>
                              <p className="font-bold text-gray-900 dark:text-white">{apt.type || "Consultation"}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(apt.appointmentDate).toLocaleDateString()} at {apt.time}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${apt.status === "completed" ? "bg-green-100 text-green-700 dark:bg-green-500/10" : "bg-gray-100 text-gray-700"}`}>
                              {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400 italic bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl">No past appointments found.</p>
                    )}
                  </section>
                </>
              )}
            </div>

            <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80 flex justify-end gap-4">
              <button onClick={closeModal} className="px-6 py-2.5 rounded-xl font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Close Records</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorPatients;