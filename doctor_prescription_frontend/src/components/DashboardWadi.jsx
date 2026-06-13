import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  AlertCircle,
  Clock,
  Activity,
  ArrowRight,
  ArrowLeft,
  Droplet,
  Zap,
  Sun,
  ShieldAlert,
  Loader2,
  CalendarPlus,
  Stethoscope,
  FileText,
  Check,
  Plus,
} from "lucide-react";
import api from "../api/axios";

const DashboardWadi = ({ setActiveTab }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedRecord, setSavedRecord] = useState(null);

  const [assessment, setAssessment] = useState({
    symptom: "",
    affectedEye: "",
    onset: "",
    associatedSymptoms: [],
    duration: "",
    severity: 5,
    medicalContext: {
      wearsContacts: false,
      hasDiabetes: false,
      hasAllergies: false,
      recentTrauma: false,
    },
  });

  const primarySymptoms = [
    { id: "blurry", label: "Blurry Vision", icon: <Eye className="w-6 h-6" /> },
    {
      id: "redness",
      label: "Red or Bloodshot Eyes",
      icon: <AlertCircle className="w-6 h-6" />,
    },
    {
      id: "dryness",
      label: "Dry or Itchy Eyes",
      icon: <Droplet className="w-6 h-6" />,
    },
    {
      id: "pain",
      label: "Eye Pain or Pressure",
      icon: <Activity className="w-6 h-6" />,
    },
    {
      id: "flashes",
      label: "Flashes or Floaters",
      icon: <Zap className="w-6 h-6" />,
    },
    {
      id: "light",
      label: "Light Sensitivity",
      icon: <Sun className="w-6 h-6" />,
    },
  ];

  const secondarySymptomsList = [
    "Discharge / Crusting",
    "Tearing / Watering",
    "Itching",
    "Foreign Body Sensation",
    "Double Vision",
    "Halos Around Lights",
    "Headaches",
    "Loss of Side Vision",
  ];
  const durations = [
    "Just started (Today)",
    "A few days",
    "About a week",
    "More than a week",
    "Ongoing for months",
  ];

  const toggleAssociatedSymptom = (symp) => {
    setAssessment((prev) => ({
      ...prev,
      associatedSymptoms: prev.associatedSymptoms.includes(symp)
        ? prev.associatedSymptoms.filter((s) => s !== symp)
        : [...prev.associatedSymptoms, symp],
    }));
  };

  const handleContextChange = (field) => {
    setAssessment((prev) => ({
      ...prev,
      medicalContext: {
        ...prev.medicalContext,
        [field]: !prev.medicalContext[field],
      },
    }));
  };

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setStep(7);
    }, 2500);
  };

  const handleSaveAndBook = async () => {
    setIsSaving(true);
    try {
      const clinicalNotes = `Eye Involved: ${assessment.affectedEye} | Onset: ${assessment.onset} | Associated: ${assessment.associatedSymptoms.join(", ") || "None"} | Contacts: ${assessment.medicalContext.wearsContacts ? "Yes" : "No"}, Diabetes: ${assessment.medicalContext.hasDiabetes ? "Yes" : "No"}, Allergies: ${assessment.medicalContext.hasAllergies ? "Yes" : "No"}, Trauma: ${assessment.medicalContext.recentTrauma ? "Yes" : "No"}`;

      // 🔴 PERFECTLY MATCHES BACKEND symptoms.controller.js EXPECTATIONS
      const payload = {
        primarySymptoms: assessment.symptom,
        investigationAnswers: [
          { question: "Affected Eye", answer: assessment.affectedEye },
          { question: "Onset", answer: assessment.onset },
          {
            question: "Associated Symptoms",
            answer: assessment.associatedSymptoms.join(", ") || "None",
          },
          { question: "Duration", answer: assessment.duration },
          { question: "Severity", answer: assessment.severity.toString() },
          { question: "Medical Context", answer: clinicalNotes },
        ],
      };

      const res = await api.post("/patient/assessment", payload);
      setSavedRecord(res.data);
      setStep(8);
    } catch (error) {
      console.error("Failed to save detailed assessment.", error);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (step === 6) handleAnalyze();
  }, [step]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 md:p-10 transition-all duration-300">
      {step < 6 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <button
            onClick={() =>
              step > 1 ? setStep(step - 1) : setActiveTab("overview")
            }
            className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors font-medium">
            <ArrowLeft className="w-4 h-4" />{" "}
            {step > 1 ? "Previous Step" : "Cancel Investigation"}
          </button>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((dot) => (
              <div
                key={dot}
                className={`w-10 h-1.5 rounded-full transition-colors ${step >= dot ? "bg-primary" : "bg-gray-200 dark:bg-gray-700"}`}></div>
            ))}
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="animate-fade-in-up">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            What is your primary reason for evaluating today?
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            Select the main eye symptom you are currently experiencing.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {primarySymptoms.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setAssessment({ ...assessment, symptom: item.label });
                  setStep(2);
                }}
                className={`flex flex-col items-center justify-center text-center p-6 rounded-2xl border-2 transition-all group ${assessment.symptom === item.label ? "border-primary bg-primary/10" : "border-gray-100 dark:border-gray-700 hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10"}`}>
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all mb-4 ${assessment.symptom === item.label ? "bg-primary text-white" : "bg-gray-50 dark:bg-gray-700 text-gray-400 group-hover:text-primary group-hover:scale-110"}`}>
                  {item.icon}
                </div>
                <span className="font-semibold text-gray-800 dark:text-white">
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="animate-fade-in-up max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Let's narrow it down.
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            Tell us exactly where and how the {assessment.symptom.toLowerCase()}{" "}
            began.
          </p>
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Which eye is affected?
              </h3>
              <div className="flex gap-4">
                {["Left Eye", "Right Eye", "Both Eyes"].map((eye) => (
                  <button
                    key={eye}
                    onClick={() =>
                      setAssessment({ ...assessment, affectedEye: eye })
                    }
                    className={`flex-1 py-4 rounded-xl border-2 font-bold transition-all ${assessment.affectedEye === eye ? "border-primary bg-primary/10 text-primary" : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-primary"}`}>
                    {eye}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                How did this start?
              </h3>
              <div className="flex gap-4">
                {[
                  "Suddenly (Overnight or instantly)",
                  "Gradually (Worsening over time)",
                ].map((onset) => (
                  <button
                    key={onset}
                    onClick={() =>
                      setAssessment({
                        ...assessment,
                        onset: onset.split(" ")[0],
                      })
                    }
                    className={`flex-1 py-4 px-2 rounded-xl border-2 font-bold transition-all ${assessment.onset === onset.split(" ")[0] ? "border-primary bg-primary/10 text-primary" : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-primary"}`}>
                    {onset}
                  </button>
                ))}
              </div>
            </div>
            <button
              disabled={!assessment.affectedEye || !assessment.onset}
              onClick={() => setStep(3)}
              className="w-full bg-primary text-white py-4 rounded-xl font-bold hover:bg-primary-dark transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-8">
              Continue <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="animate-fade-in-up max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Are you experiencing anything else?
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            Select any additional issues accompanying your main symptom.
          </p>
          <div className="flex flex-wrap gap-3 mb-10">
            {secondarySymptomsList.map((symp) => {
              const isSelected = assessment.associatedSymptoms.includes(symp);
              return (
                <button
                  key={symp}
                  onClick={() => toggleAssociatedSymptom(symp)}
                  className={`px-5 py-3 rounded-full border-2 font-medium flex items-center gap-2 transition-all ${isSelected ? "border-primary bg-primary text-white shadow-md" : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-primary/50 hover:text-primary"}`}>
                  {isSelected && <Check className="w-4 h-4" />} {symp}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => setStep(4)}
            className="w-full max-w-2xl mx-auto bg-primary text-white py-4 rounded-xl font-bold hover:bg-primary-dark transition-all flex items-center justify-center gap-2">
            Continue <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {step === 4 && (
        <div className="animate-fade-in-up max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
            Duration and Intensity
          </h2>
          <div className="space-y-10">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" /> How long has this
                been happening?
              </h3>
              <div className="flex flex-wrap gap-3">
                {durations.map((duration) => (
                  <button
                    key={duration}
                    onClick={() => setAssessment({ ...assessment, duration })}
                    className={`px-5 py-2.5 rounded-full border-2 font-medium transition-all ${assessment.duration === duration ? "border-primary bg-primary/10 text-primary" : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-primary"}`}>
                    {duration}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" /> Rate the severity
                (1-10)
              </h3>
              <input
                type="range"
                min="1"
                max="10"
                value={assessment.severity}
                onChange={(e) =>
                  setAssessment({
                    ...assessment,
                    severity: Number(e.target.value),
                  })
                }
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-sm text-gray-500 font-medium mt-3">
                <span>Mild Annoyance</span>
                <span className="text-primary font-bold text-2xl">
                  {assessment.severity}
                </span>
                <span>Unbearable</span>
              </div>
            </div>
            <button
              disabled={!assessment.duration}
              onClick={() => setStep(5)}
              className="w-full bg-primary text-white py-4 rounded-xl font-bold hover:bg-primary-dark transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-8">
              Continue <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="animate-fade-in-up max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Final Step: Medical History
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            This context is vital for our specialists to provide accurate
            triage.
          </p>
          <div className="space-y-4 mb-10">
            {[
              {
                id: "wearsContacts",
                label: "Do you currently wear contact lenses?",
                icon: <Eye className="w-5 h-5" />,
              },
              {
                id: "hasDiabetes",
                label: "Have you been diagnosed with Diabetes?",
                icon: <Activity className="w-5 h-5" />,
              },
              {
                id: "hasAllergies",
                label: "Do you have seasonal or severe allergies?",
                icon: <Sun className="w-5 h-5" />,
              },
              {
                id: "recentTrauma",
                label: "Has there been any recent injury or trauma to the eye?",
                icon: <AlertCircle className="w-5 h-5" />,
              },
            ].map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border border-gray-100 dark:border-gray-600">
                <div className="flex items-center gap-3 text-gray-800 dark:text-gray-200 font-medium">
                  <div className="text-primary">{item.icon}</div>
                  {item.label}
                </div>
                <button
                  onClick={() => handleContextChange(item.id)}
                  className={`w-14 h-7 rounded-full flex items-center transition-colors px-1 ${assessment.medicalContext[item.id] ? "bg-primary" : "bg-gray-300 dark:bg-gray-600"}`}>
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${assessment.medicalContext[item.id] ? "transform translate-x-7" : ""}`}
                  />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={() => setStep(6)}
            className="w-full bg-primary text-white py-4 rounded-xl font-bold hover:bg-primary-dark transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/30">
            Start Investigation Engine <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {step === 6 && (
        <div className="text-center py-16 animate-fade-in-up">
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <Stethoscope className="absolute inset-0 m-auto w-8 h-8 text-primary animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Compiling Clinical Profile...
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Our engine is processing your systemic and ocular history.
          </p>
        </div>
      )}

      {step === 7 && (
        <div className="text-center animate-fade-in-up max-w-2xl mx-auto py-8">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Investigation Complete
          </h2>
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-6 text-left mb-8 border border-gray-100 dark:border-gray-700">
            <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
              Based on your clinical intake reporting{" "}
              <strong>{assessment.onset.toLowerCase()} onset</strong> of{" "}
              <strong>{assessment.symptom.toLowerCase()}</strong> in your{" "}
              <strong>{assessment.affectedEye.toLowerCase()}</strong>, lasting
              for <strong>{assessment.duration.toLowerCase()}</strong> at a
              severity level of <strong>{assessment.severity}/10</strong>, we
              highly recommend consulting with a specialist.
            </p>
            {(assessment.medicalContext.wearsContacts ||
              assessment.medicalContext.hasDiabetes) && (
              <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400 p-4 rounded-xl text-sm font-medium border border-yellow-200 dark:border-yellow-700/50">
                <strong>Important Note:</strong> Your history of{" "}
                {assessment.medicalContext.wearsContacts
                  ? "contact lens use "
                  : ""}
                {assessment.medicalContext.hasDiabetes ? "and diabetes" : ""}{" "}
                has been flagged for the doctor.
              </div>
            )}
          </div>
          <button
            onClick={handleSaveAndBook}
            disabled={isSaving}
            className="bg-primary text-white px-8 py-4 w-full rounded-xl font-bold hover:bg-primary-dark transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/30">
            {isSaving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <CalendarPlus className="w-5 h-5" /> Save Record & Book
                Specialist
              </>
            )}
          </button>
        </div>
      )}

      {step === 8 && savedRecord && (
        <div className="text-center animate-fade-in-up max-w-2xl mx-auto py-8">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Assessment Saved Successfully!
          </h2>
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-6 text-left mb-8 border border-gray-100 dark:border-gray-700">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" /> Your Saved Record
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-gray-200 dark:border-gray-600 pb-2">
                <span className="text-gray-500 dark:text-gray-400">
                  Primary Symptom:
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {savedRecord.assessment?.primarySymptoms ||
                    assessment.symptom}
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-200 dark:border-gray-600 pb-2">
                <span className="text-gray-500 dark:text-gray-400">
                  Recommended Specialist:
                </span>
                <span className="font-bold text-primary">
                  {savedRecord.recommendation || "Optometrist"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">
                  Severity:
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {assessment.severity}/10
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/patient-dashboard/records")}
              className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-6 py-4 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all flex items-center justify-center gap-2">
              <FileText className="w-5 h-5" /> View All Records
            </button>
            <button
              onClick={() => {
                setStep(1);
                setSavedRecord(null);
                setAssessment({
                  symptom: "",
                  affectedEye: "",
                  onset: "",
                  associatedSymptoms: [],
                  duration: "",
                  severity: 5,
                  medicalContext: {
                    wearsContacts: false,
                    hasDiabetes: false,
                    hasAllergies: false,
                    recentTrauma: false,
                  },
                });
              }}
              className="flex-1 bg-primary text-white px-6 py-4 rounded-xl font-bold hover:bg-primary-dark transition-all flex items-center justify-center gap-2 shadow-lg">
              <Plus className="w-5 h-5" /> Create Another Assessment
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardWadi;
