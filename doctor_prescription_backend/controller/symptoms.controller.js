const Symptom = require("../model/symptom.model");

// -----------------------------------------
// @route   POST /api/v1/patient/assessment
// @desc    Submit Wadi assessment and get a recommendation
// -----------------------------------------
exports.submitAssessment = async (req, res) => {
  try {
    const { primarySymptoms, investigationAnswers } = req.body;

    if (
      !primarySymptoms ||
      !investigationAnswers ||
      !Array.isArray(investigationAnswers)
    ) {
      return res
        .status(400)
        .json({ error: "Please provide valid symptom details." });
    }

    // Triage Logic: Default to Optometrist
    let recommendedSpecialist = "Optometrist";
    const highRiskKeywords = [
      "pain",
      "sudden",
      "loss",
      "sharp",
      "severe",
      "bleeding",
      "blindness",
    ];

    // Scan the answers for high-risk flags
    investigationAnswers.forEach((item) => {
      if (item.answer) {
        const answerText = item.answer.toLowerCase();
        if (highRiskKeywords.some((keyword) => answerText.includes(keyword))) {
          recommendedSpecialist = "Ophthalmologist"; // Escalate to specialist
        }
      }
    });

    // Save the assessment to the database
    const newAssessment = await Symptom.create({
      patient: req.user.id, // Injected by the protect middleware
      primarySymptoms,
      investigationAnswers,
      recommendedSpecialist,
    });

    res.status(201).json({
      message: "Assessment completed successfully",
      recommendation: recommendedSpecialist,
      assessmentId: newAssessment._id,
    });
  } catch (error) {
    console.error("Assessment Error:", error);
    res.status(500).json({ error: "Server error processing assessment." });
  }
};

// -----------------------------------------
// @route   GET /api/v1/patient/assessment/history
// @desc    Get patient's past assessments
// -----------------------------------------
exports.getAssessmentHistory = async (req, res) => {
  try {
    const assessments = await Symptom.find({ patient: req.user.id }).sort({
      createdAt: -1,
    });
    res.status(200).json({ count: assessments.length, data: assessments });
  } catch (error) {
    console.error("Fetch Assessment Error:", error);
    res.status(500).json({ error: "Server error fetching history." });
  }
};
