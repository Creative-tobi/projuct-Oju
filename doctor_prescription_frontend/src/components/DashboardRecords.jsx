import React, { useState, useEffect } from "react";
import {
  FileText,
  Activity,
  Download,
  Pill,
  Eye,
  Calendar,
  Loader2,
  ShieldCheck,
  FileWarning,
} from "lucide-react";
import api from "../api/axios";

const DashboardRecords = () => {
  const [activeTab, setActiveTab] = useState("assessments"); // 'assessments' or 'prescriptions'
  const [isLoading, setIsLoading] = useState(true);

  // Data States
  const [assessments, setAssessments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);

  useEffect(() => {
    const fetchMedicalRecords = async () => {
      setIsLoading(true);
      try {
        // Fetch Patient Assessments (Wadi History)
        const assessRes = await api.get("/assessments/patient");
        if (assessRes.data && assessRes.data.length > 0) {
          setAssessments(assessRes.data);
        } else {
          // Fallback Dummy Data
          setAssessments([
            {
              _id: "a1",
              date: new Date(Date.now() - 86400000 * 5).toISOString(),
              symptom: "Blurry Vision",
              duration: "A few days",
              severity: 6,
              status: "Consulted",
              notes:
                "Patient reported difficulty focusing on near objects. Referred to Dr. Aisha for full comprehensive scan.",
            },
            {
              _id: "a2",
              date: new Date(Date.now() - 86400000 * 45).toISOString(),
              symptom: "Red or Bloodshot Eyes",
              duration: "Just started (Today)",
              severity: 4,
              status: "Resolved",
              notes:
                "Mild conjunctivitis suspected based on symptoms. Prescribed topical eye drops.",
            },
          ]);
        }

        // Fetch Prescriptions/Doctor Notes
        const scriptRes = await api.get("/prescriptions/patient");
        if (scriptRes.data && scriptRes.data.length > 0) {
          setPrescriptions(scriptRes.data);
        } else {
          // Fallback Dummy Data
          setPrescriptions([
            {
              _id: "p1",
              date: new Date(Date.now() - 86400000 * 4).toISOString(),
              doctor: "Dr. Aisha Rahman",
              diagnosis: "Myopia (Nearsightedness)",
              medication: "Corrective Lenses prescribed: OD -1.50, OS -1.75",
              instructions: "Wear glasses for driving and screen time.",
            },
            {
              _id: "p2",
              date: new Date(Date.now() - 86400000 * 45).toISOString(),
              doctor: "Dr. Samuel Johnson",
              diagnosis: "Bacterial Conjunctivitis",
              medication: "Ofloxacin Ophthalmic Solution 0.3%",
              instructions:
                "Apply 1 drop to the affected eye(s) every 2 to 4 hours for 2 days, then 4 times daily for 5 days.",
            },
          ]);
        }
      } catch (error) {
        console.error("Error fetching medical records:", error);
        // Silent fallback for smooth UI on frontend testing
      } finally {
        setIsLoading(false);
      }
    };

    fetchMedicalRecords();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Medical Records
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          Securely access your Patient Assessments and clinical prescriptions.
        </p>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex gap-4 mb-8 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab("assessments")}
          className={`pb-4 px-2 text-sm font-bold transition-all relative flex items-center gap-2 ${
            activeTab === "assessments"
              ? "text-primary"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }`}>
          <Activity className="w-4 h-4" /> Patient Assessments
          {activeTab === "assessments" && (
            <span className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full"></span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("prescriptions")}
          className={`pb-4 px-2 text-sm font-bold transition-all relative flex items-center gap-2 ${
            activeTab === "prescriptions"
              ? "text-primary"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }`}>
          <Pill className="w-4 h-4" /> Prescriptions & Notes
          {activeTab === "prescriptions" && (
            <span className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full"></span>
          )}
        </button>
      </div>

      {/* Content Area: Patient Assessments */}
      {activeTab === "assessments" && (
        <div className="space-y-6">
          {assessments.length > 0 ? (
            assessments.map((record) => (
              <div
                key={record._id}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Activity className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                        Wadi Investigation: {record.symptom}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(record.date).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`px-4 py-1.5 rounded-full text-sm font-bold shrink-0 ${
                      record.status === "Resolved"
                        ? "bg-green-100 text-green-700 dark:bg-green-500/10"
                        : "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10"
                    }`}>
                    {record.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl border border-gray-100 dark:border-gray-600">
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                      Reported Severity
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{
                            width: `${(record.severity / 10) * 100}%`,
                          }}></div>
                      </div>
                      <span className="font-bold text-primary">
                        {record.severity}/10
                      </span>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl border border-gray-100 dark:border-gray-600">
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                      Duration
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {record.duration}
                    </p>
                  </div>
                </div>

                {record.notes && (
                  <div className="mt-6 bg-primary/5 p-4 rounded-xl border border-primary/10">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <strong className="text-primary mr-2">
                        System Notes:
                      </strong>
                      {record.notes}
                    </p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700">
              <FileWarning className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                No Assessments Found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                You haven't completed any Wadi assessments yet.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Content Area: Prescriptions */}
      {activeTab === "prescriptions" && (
        <div className="space-y-6">
          {prescriptions.length > 0 ? (
            prescriptions.map((record) => (
              <div
                key={record._id}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Eye className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                        {record.diagnosis}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Prescribed by {record.doctor}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(record.date).toLocaleDateString()}
                    </span>
                    <button
                      className="text-primary hover:bg-primary/10 p-2 rounded-lg transition-colors border border-transparent hover:border-primary/20"
                      title="Download Record">
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-1">
                      <Pill className="w-4 h-4 text-primary" /> Medication /
                      Device
                    </h4>
                    <p className="text-gray-700 dark:text-gray-300 text-sm bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg border border-gray-100 dark:border-gray-600">
                      {record.medication}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-1">
                      <ShieldCheck className="w-4 h-4 text-primary" /> Clinical
                      Instructions
                    </h4>
                    <p className="text-gray-700 dark:text-gray-300 text-sm bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg border border-gray-100 dark:border-gray-600">
                      {record.instructions}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700">
              <FileWarning className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                No Prescriptions Found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                You currently have no active prescriptions or clinical notes.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DashboardRecords;
