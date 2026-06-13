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
  Loader2,
  UserPlus,
  ShieldAlert,
} from "lucide-react";

const AssessmentPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [assessment, setAssessment] = useState({
    symptom: "",
    duration: "",
    severity: 3,
  });

  const symptoms = [
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

  const durations = [
    "Just started (Today)",
    "A few days",
    "About a week",
    "More than a week",
    "Ongoing for months",
  ];

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setStep(4);
    }, 2500);
  };

  useEffect(() => {
    if (step === 3) handleAnalyze();
  }, [step]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans transition-colors duration-300 py-12 px-4 md:px-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8 md:mb-12">
          <button
            onClick={() => (step > 1 ? setStep(step - 1) : navigate("/"))}
            className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors font-medium">
            <ArrowLeft className="w-4 h-4" />{" "}
            {step > 1 ? "Previous Step" : "Back to Home"}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <Eye className="text-white w-4 h-4" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              Wadi Investigator
            </span>
          </div>
        </div>

        {step < 4 && (
          <div className="mb-8 md:mb-10">
            <div className="flex justify-between text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              <span>Primary Symptom</span>
              <span>Duration & Severity</span>
              <span>Analysis</span>
            </div>
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${(step / 3) * 100}%` }}></div>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 p-6 md:p-12 transition-all duration-300">
          {step === 1 && (
            <div className="animate-fade-in-up">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                What seems to be the issue?
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mb-8">
                Select the primary eye symptom you are currently experiencing.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {symptoms.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setAssessment({ ...assessment, symptom: item.label });
                      setStep(2);
                    }}
                    className="flex flex-col items-center text-center p-6 rounded-2xl border-2 border-gray-100 dark:border-gray-700 hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-all group">
                    <div className="w-12 h-12 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-400 group-hover:text-primary group-hover:scale-110 transition-all mb-4">
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
            <div className="animate-fade-in-up">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                How long has this been happening?
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mb-8">
                Tell us about the duration and severity of your{" "}
                {assessment.symptom.toLowerCase()}.
              </p>
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" /> Duration
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {durations.map((duration) => (
                      <button
                        key={duration}
                        onClick={() =>
                          setAssessment({ ...assessment, duration })
                        }
                        className={`px-5 py-2.5 rounded-full border font-medium transition-all ${assessment.duration === duration ? "bg-primary border-primary text-white shadow-md" : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-primary hover:text-primary"}`}>
                        {duration}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" /> Severity
                    (1-10)
                  </h3>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={assessment.severity}
                    onChange={(e) =>
                      setAssessment({ ...assessment, severity: e.target.value })
                    }
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-sm text-gray-500 font-medium mt-2">
                    <span>Mild Discomfort</span>
                    <span className="text-primary font-bold text-lg">
                      {assessment.severity}
                    </span>
                    <span>Severe Pain</span>
                  </div>
                </div>
                <button
                  disabled={!assessment.duration}
                  onClick={() => setStep(3)}
                  className="w-full bg-primary text-white py-4 rounded-xl font-bold hover:bg-primary-dark transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-8 shadow-lg shadow-primary/30">
                  Continue to Analysis <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-12 animate-fade-in-up">
              <div className="relative w-24 h-24 mx-auto mb-8">
                <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <Eye className="absolute inset-0 m-auto w-8 h-8 text-primary animate-pulse" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Wadi is investigating...
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                Comparing your symptoms with our clinical database to find the
                right specialist.
              </p>
            </div>
          )}

          {step === 4 && (
            <div className="text-center animate-fade-in-up">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldAlert className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Investigation Complete
              </h2>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-6 text-left mb-8 border border-gray-100 dark:border-gray-700">
                <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                  Based on your report of{" "}
                  <strong>{assessment.symptom.toLowerCase()}</strong> lasting
                  for <strong>{assessment.duration.toLowerCase()}</strong> with
                  a severity level of <strong>{assessment.severity}/10</strong>,
                  we highly recommend consulting with a specialist to rule out
                  any underlying optical conditions.
                </p>
                <div className="flex items-center gap-3 text-primary font-medium bg-primary/10 p-4 rounded-xl">
                  <UserPlus className="w-5 h-5" />
                  <span>We have matched you with active specialists.</span>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                Sign in to your existing account or create a new one to save
                your Wadi assessment results and instantly book an online or
                physical consultation.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {/* 🔴 UPDATED: Explicitly mentions both Login and Register, routing to the unified /login page */}
                <button
                  onClick={() => navigate("/login")}
                  className="bg-primary text-white px-8 py-3.5 rounded-xl font-bold hover:bg-primary-dark transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/30">
                  Login or Register to Consult{" "}
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssessmentPage;
