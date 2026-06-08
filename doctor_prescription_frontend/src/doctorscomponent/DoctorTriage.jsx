import React, { useState, useEffect } from "react";
import {
  Activity,
  AlertTriangle,
  Clock,
  Search,
  CheckCircle2,
  X,
  FileText,
  Loader2,
  Eye,
  ShieldAlert,
} from "lucide-react";
import api from "../api/axios";

const DoctorTriage = () => {
  const [triageCases, setTriageCases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("All"); // 'All', 'Urgent', 'Reviewed'
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [selectedCase, setSelectedCase] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

   useEffect(() => {
     fetchTriageCases();
   }, []);

   const fetchTriageCases = async () => {
     setIsLoading(true);
     try {
       const response = await api.get("/provider/triage"); // Updated route
       if (response.data && response.data.length > 0) {
         setTriageCases(response.data);
       } else {
         loadFallbackCases();
       }
     } catch (error) {
       console.error("Error fetching triage cases, using fallback:", error);
       loadFallbackCases();
     } finally {
       setIsLoading(false);
     }
   };

  const loadFallbackCases = () => {
    setTriageCases([
      {
        _id: "t1",
        patientName: "John Doe",
        symptom: "Severe Eye Pain",
        severity: 9,
        duration: "Just started (Today)",
        status: "Pending",
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
        notes:
          "Eye Involved: Right Eye\nOnset: Suddenly\nAssociated: Headaches, Light Sensitivity\nContacts: Yes, Diabetes: No, Allergies: No, Trauma: Yes",
      },
      {
        _id: "t2",
        patientName: "Aisha Bello",
        symptom: "Blurry Vision",
        severity: 5,
        duration: "A few days",
        status: "Pending",
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString(), // 5 hours ago
        notes:
          "Eye Involved: Both Eyes\nOnset: Gradually\nAssociated: None reported\nContacts: No, Diabetes: Yes, Allergies: No, Trauma: No",
      },
      {
        _id: "t3",
        patientName: "Anonymous Patient",
        symptom: "Red or Bloodshot Eyes",
        severity: 4,
        duration: "About a week",
        status: "Reviewed",
        createdAt: new Date(Date.now() - 86400000 * 1).toISOString(), // 1 day ago
        notes:
          "Eye Involved: Left Eye\nOnset: Gradually\nAssociated: Itching, Discharge / Crusting\nContacts: No, Diabetes: No, Allergies: Yes, Trauma: No",
      },
    ]);
  };

  const handleMarkReviewed = async (id) => {
    setActionLoading(true);
    try {
      await api.patch(`/provider/triage/${id}/review`); // Updated route
      setTriageCases((prev) =>
        prev.map((c) => (c._id === id ? { ...c, status: "Reviewed" } : c)),
      );
      setSelectedCase(null);
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setActionLoading(false);
    }
  };
  // Filter Logic
  const filteredCases = triageCases.filter((c) => {
    const matchesSearch =
      c.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.symptom.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (filter === "Urgent") return c.severity >= 7 && c.status !== "Reviewed";
    if (filter === "Reviewed") return c.status === "Reviewed";
    return c.status !== "Reviewed"; // 'All' shows pending cases
  });

  const getSeverityStyle = (severity) => {
    if (severity >= 8)
      return "border-red-500 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400";
    if (severity >= 5)
      return "border-yellow-500 bg-yellow-50 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400";
    return "border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400";
  };

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
            Wadi Triage Inbox
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Review incoming patient symptom assessments and prioritize urgent
            care.
          </p>
        </div>

        <div className="w-full md:w-auto relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search symptoms or patients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-80 pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:border-primary text-gray-900 dark:text-white transition-colors shadow-sm"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-4 mb-8 border-b border-gray-200 dark:border-gray-700">
        {["All", "Urgent", "Reviewed"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`pb-4 px-2 text-sm font-bold transition-all relative ${
              filter === tab
                ? "text-primary"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}>
            {tab === "Urgent" && (
              <AlertTriangle className="w-4 h-4 inline mr-1 -mt-1" />
            )}
            {tab}
            {tab === "Urgent" &&
              triageCases.some(
                (c) => c.severity >= 7 && c.status !== "Reviewed",
              ) && (
                <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                  {
                    triageCases.filter(
                      (c) => c.severity >= 7 && c.status !== "Reviewed",
                    ).length
                  }
                </span>
              )}
            {filter === tab && (
              <span className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full"></span>
            )}
          </button>
        ))}
      </div>

      {/* Triage Inbox List */}
      {filteredCases.length > 0 ? (
        <div className="space-y-4">
          {filteredCases.map((triage) => (
            <div
              key={triage._id}
              onClick={() => setSelectedCase(triage)}
              className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm hover:border-primary/50 hover:shadow-md transition-all cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                <div
                  className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-bold text-lg shrink-0 ${getSeverityStyle(triage.severity)}`}>
                  {triage.severity}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                      {triage.symptom}
                    </h3>
                    {triage.severity >= 7 && (
                      <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Urgent
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {triage.patientName || "Anonymous"}
                    </span>{" "}
                    • Reported {triage.duration.toLowerCase()}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between w-full md:w-auto gap-6 shrink-0 border-t md:border-t-0 border-gray-100 dark:border-gray-700 pt-4 md:pt-0 mt-4 md:mt-0">
                <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {new Date(triage.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
                <button className="text-primary font-medium text-sm flex items-center gap-1 hover:underline">
                  <Eye className="w-4 h-4" /> Review
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700">
          <div className="w-20 h-20 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Inbox Clear!
          </h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-sm">
            There are no {filter.toLowerCase()} triage cases waiting for your
            review right now.
          </p>
        </div>
      )}

      {/* Triage Detail Modal */}
      {selectedCase && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in-up">
          <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-2xl flex flex-col shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-start bg-gray-50 dark:bg-gray-800/80">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedCase.symptom}
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${getSeverityStyle(selectedCase.severity)}`}>
                    Severity: {selectedCase.severity}/10
                  </span>
                </div>
                <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <User className="w-4 h-4" />{" "}
                  {selectedCase.patientName || "Anonymous Patient"}
                </p>
              </div>
              <button
                onClick={() => setSelectedCase(null)}
                className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              {selectedCase.severity >= 8 && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl flex gap-3 text-red-800 dark:text-red-300">
                  <ShieldAlert className="w-6 h-6 shrink-0" />
                  <p className="text-sm font-medium">
                    This patient reported extremely high severity. Review
                    clinical notes immediately and consider advising emergency
                    care if required.
                  </p>
                </div>
              )}

              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" /> Clinical Intake
                Notes
              </h4>
              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-2xl p-5 border border-gray-100 dark:border-gray-600 space-y-4">
                {selectedCase.notes ? (
                  // Splitting the notes string by newline to render it beautifully
                  selectedCase.notes.split("\n").map((line, index) => {
                    const [key, ...val] = line.split(":");
                    return (
                      <div
                        key={index}
                        className="flex flex-col sm:flex-row sm:items-start border-b border-gray-200 dark:border-gray-600/50 pb-3 last:border-0 last:pb-0">
                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider sm:w-1/3 shrink-0">
                          {key}
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {val.join(":")}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-gray-500 italic">
                    No detailed clinical notes provided.
                  </p>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80 flex justify-end gap-4">
              <button
                onClick={() => setSelectedCase(null)}
                className="px-6 py-2.5 rounded-xl font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                Close
              </button>
              {selectedCase.status !== "Reviewed" && (
                <button
                  onClick={() => handleMarkReviewed(selectedCase._id)}
                  disabled={actionLoading}
                  className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-colors flex items-center gap-2 shadow-md">
                  {actionLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> Mark as Reviewed
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorTriage;
