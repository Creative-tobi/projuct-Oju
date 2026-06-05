import React, { useState, useEffect } from "react";
import {
  Search,
  User,
  Mail,
  Phone,
  Calendar,
  Activity,
  Pill,
  FileText,
  Loader2,
  X,
  ChevronRight,
  Users,
} from "lucide-react";
import api from "../api/axios";

const DoctorPatients = () => {
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal States
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [patientHistory, setPatientHistory] = useState({
    assessments: [],
    prescriptions: [],
  });

  useEffect(() => {
    const fetchPatients = async () => {
      setIsLoading(true);
      try {
        // Assuming your backend has an endpoint to get all patients assigned to/consulted by this doctor
        const response = await api.get("/doctor/patients");
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
      {
        _id: "p1",
        fullName: "Olasunkanmi",
        email: "ola@example.com",
        phone: "+234 800 123 4567",
        dob: "1998-05-14",
        gender: "Male",
        profilePicture: "https://i.pravatar.cc/150?img=12",
        lastVisit: new Date(Date.now() - 86400000 * 5).toISOString(),
      },
      {
        _id: "p2",
        fullName: "Aisha Bello",
        email: "aisha.b@example.com",
        phone: "+234 801 987 6543",
        dob: "1995-11-22",
        gender: "Female",
        profilePicture: "https://i.pravatar.cc/150?img=5",
        lastVisit: new Date(Date.now() - 86400000 * 12).toISOString(),
      },
      {
        _id: "p3",
        fullName: "Chidi Okafor",
        email: "chidi.o@example.com",
        phone: "+234 802 333 4444",
        dob: "1988-03-10",
        gender: "Male",
        profilePicture: "https://i.pravatar.cc/150?img=11",
        lastVisit: new Date(Date.now() - 86400000 * 30).toISOString(),
      },
    ]);
  };

  const handleViewHistory = async (patient) => {
    setSelectedPatient(patient);
    setHistoryLoading(true);

    try {
      // Fetch specific patient's medical history
      const assessRes = await api.get(`/assessments/patient/${patient._id}`);
      const scriptRes = await api.get(`/prescriptions/patient/${patient._id}`);

      setPatientHistory({
        assessments: assessRes.data || [],
        prescriptions: scriptRes.data || [],
      });
    } catch (error) {
      console.error("Could not fetch history, loading mock history.");
      // Mock history for demonstration
      setTimeout(() => {
        setPatientHistory({
          assessments: [
            {
              _id: "a1",
              date: new Date().toISOString(),
              symptom: "Blurry Vision",
              severity: 6,
              status: "Completed",
              notes: "Patient struggling with near-sighted tasks.",
            },
          ],
          prescriptions: [
            {
              _id: "r1",
              date: new Date().toISOString(),
              diagnosis: "Myopia",
              medication: "Corrective Lenses -1.50 OD/OS",
              instructions: "Wear while working on screens.",
            },
          ],
        });
        setHistoryLoading(false);
      }, 800);
    }
  };

  const closeModal = () => {
    setSelectedPatient(null);
    setPatientHistory({ assessments: [], prescriptions: [] });
  };

  // Search Filter Logic
  const filteredPatients = patients.filter(
    (p) =>
      p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Patient Directory
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Search and manage your patient roster and clinical records.
          </p>
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

      {/* Patient Grid */}
      {filteredPatients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPatients.map((patient) => (
            <div
              key={patient._id}
              className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <img
                  src={
                    patient.profilePicture ||
                    "https://ui-avatars.com/api/?name=" + patient.fullName
                  }
                  alt={patient.fullName}
                  className="w-16 h-16 rounded-full object-cover border-2 border-primary/20"
                />
                <div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-1">
                    {patient.fullName}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {patient.gender} •{" "}
                    {new Date().getFullYear() -
                      new Date(patient.dob).getFullYear()}{" "}
                    yrs
                  </p>
                </div>
              </div>

              <div className="space-y-3 mb-6 bg-gray-50 dark:bg-gray-700/30 p-4 rounded-2xl border border-gray-100 dark:border-gray-600">
                <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                  <Mail className="w-4 h-4 text-primary shrink-0" />{" "}
                  <span className="truncate">{patient.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                  <Phone className="w-4 h-4 text-primary shrink-0" />{" "}
                  <span>{patient.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                  <Calendar className="w-4 h-4 text-primary shrink-0" />
                  <span>
                    Last visit:{" "}
                    {new Date(patient.lastVisit).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleViewHistory(patient)}
                className="w-full bg-primary/10 text-primary py-3 rounded-xl font-bold hover:bg-primary hover:text-white transition-colors flex items-center justify-center gap-2">
                <FileText className="w-4 h-4" /> View Clinical History
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700">
          <div className="w-20 h-20 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6">
            <Users className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            No patients found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-sm">
            We couldn't find any patients matching your search criteria.
          </p>
        </div>
      )}

      {/* Patient Medical History Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in-up">
          <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/80">
              <div className="flex items-center gap-4">
                <img
                  src={selectedPatient.profilePicture}
                  alt={selectedPatient.fullName}
                  className="w-12 h-12 rounded-full object-cover border-2 border-primary/20"
                />
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {selectedPatient.fullName}'s Records
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Complete Clinical History
                  </p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {historyLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 font-medium">
                    Pulling secure records...
                  </p>
                </div>
              ) : (
                <>
                  {/* Wadi Assessments Section */}
                  <section>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-primary" /> Past Wadi
                      Assessments
                    </h4>
                    {patientHistory.assessments.length > 0 ? (
                      <div className="space-y-4">
                        {patientHistory.assessments.map((assessment) => (
                          <div
                            key={assessment._id}
                            className="bg-gray-50 dark:bg-gray-700/30 p-5 rounded-2xl border border-gray-100 dark:border-gray-600">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <p className="font-bold text-gray-900 dark:text-white">
                                  {assessment.symptom}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {new Date(
                                    assessment.date,
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                              <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">
                                Sev: {assessment.severity}/10
                              </span>
                            </div>
                            {assessment.notes && (
                              <p className="text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
                                <strong className="text-primary mr-1">
                                  Triage Notes:
                                </strong>{" "}
                                {assessment.notes}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400 italic bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl">
                        No previous Wadi assessments on record.
                      </p>
                    )}
                  </section>

                  {/* Prescriptions Section */}
                  <section>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <Pill className="w-5 h-5 text-primary" /> Prescriptions &
                      Clinical Notes
                    </h4>
                    {patientHistory.prescriptions.length > 0 ? (
                      <div className="space-y-4">
                        {patientHistory.prescriptions.map((script) => (
                          <div
                            key={script._id}
                            className="bg-gray-50 dark:bg-gray-700/30 p-5 rounded-2xl border border-gray-100 dark:border-gray-600">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <p className="font-bold text-gray-900 dark:text-white text-lg">
                                  {script.diagnosis}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {new Date(script.date).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="space-y-3">
                              <div>
                                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                                  Prescribed Medication / Lenses
                                </p>
                                <p className="text-sm text-gray-900 dark:text-white font-medium">
                                  {script.medication}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                                  Doctor's Instructions
                                </p>
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                  {script.instructions}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400 italic bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl">
                        No prescriptions have been issued yet.
                      </p>
                    )}
                  </section>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80 flex justify-end gap-4">
              <button
                onClick={closeModal}
                className="px-6 py-2.5 rounded-xl font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                Close Records
              </button>
              <button className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-colors flex items-center gap-2 shadow-md">
                <FileText className="w-4 h-4" /> Add New Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorPatients;
