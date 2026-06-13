import React, { useState, useEffect } from "react";
import { FileText, Activity, Pill, Eye, Calendar, Loader2, ShieldCheck, FileWarning, Plus, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const DashboardRecords = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("assessments");
  const [isLoading, setIsLoading] = useState(true);
  const [assessments, setAssessments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);

  useEffect(() => {
    const fetchMedicalRecords = async () => {
      setIsLoading(true);
      try {
        // 🔴 CORRECT ENDPOINT: Fetch Patient Assessments (Wadi History)
        const assessRes = await api.get("/patient/assessment/history");
        if (assessRes.data && assessRes.data.data && assessRes.data.data.length > 0) {
          setAssessments(assessRes.data.data);
        } else {
          setAssessments([]);
        }

        // Fetch Prescriptions (Fallback to dummy if endpoint isn't fully built yet)
        try {
          const scriptRes = await api.get("/patient/prescriptions");
          if (scriptRes.data && scriptRes.data.length > 0) setPrescriptions(scriptRes.data);
        } catch (e) {
          setPrescriptions([]);
        }
      } catch (error) {
        console.error("Error fetching medical records:", error);
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Medical Records</h2>
          <p className="text-gray-500 dark:text-gray-400">Securely access your Patient Assessments and clinical prescriptions.</p>
        </div>
        {activeTab === "assessments" && (
          <button onClick={() => navigate("/patient-dashboard/assessment")} className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold hover:bg-primary-dark transition-colors flex items-center gap-2 shadow-md">
            <Plus className="w-5 h-5" /> New Assessment
          </button>
        )}
      </div>

      <div className="flex gap-4 mb-8 border-b border-gray-200 dark:border-gray-700">
        <button onClick={() => setActiveTab("assessments")} className={`pb-4 px-2 text-sm font-bold transition-all relative flex items-center gap-2 ${activeTab === "assessments" ? "text-primary" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"}`}>
          <Activity className="w-4 h-4" /> Patient Assessments
          {activeTab === "assessments" && <span className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full"></span>}
        </button>
        <button onClick={() => setActiveTab("prescriptions")} className={`pb-4 px-2 text-sm font-bold transition-all relative flex items-center gap-2 ${activeTab === "prescriptions" ? "text-primary" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"}`}>
          <Pill className="w-4 h-4" /> Prescriptions & Notes
          {activeTab === "prescriptions" && <span className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full"></span>}
        </button>
      </div>

      {activeTab === "assessments" && (
        <div className="space-y-6">
          {assessments.length > 0 ? (
            assessments.map((record) => (
              <div key={record._id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Activity className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white">Wadi Investigation: {record.primarySymptoms}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(record.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
                      </div>
                    </div>
                  </div>
                  <span className="px-4 py-1.5 rounded-full text-sm font-bold shrink-0 bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
                    Recommended: {record.recommendedSpecialist}
                  </span>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl border border-gray-100 dark:border-gray-600 space-y-3">
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Clinical Notes Summary</p>
                  {record.investigationAnswers?.map((ans, idx) => (
                    <div key={idx} className="flex justify-between text-sm border-b border-gray-200 dark:border-gray-600 pb-2 last:border-0 last:pb-0">
                      <span className="text-gray-600 dark:text-gray-300 font-medium">{ans.question}:</span>
                      <span className="text-gray-900 dark:text-white text-right">{ans.answer}</span>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 flex justify-end">
                  <button onClick={() => navigate("/patient-dashboard/book")} className="text-primary font-medium text-sm flex items-center gap-1 hover:underline">
                    Book this Specialist <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700">
              <FileWarning className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Assessments Found</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">You haven't completed any Wadi assessments yet.</p>
              <button onClick={() => navigate("/patient-dashboard/assessment")} className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-dark transition-colors">
                Start Your First Assessment
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === "prescriptions" && (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700">
          <FileWarning className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Prescriptions Found</h3>
          <p className="text-gray-500 dark:text-gray-400">You currently have no active prescriptions or clinical notes from a doctor.</p>
        </div>
      )}
    </div>
  );
};

export default DashboardRecords;