const mongoose = require("mongoose");

const symptomSchema = new mongoose.Schema({
  patient: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Patient',
    required: true
  },
  primarySymptoms: { type: String, required: true },
  investigationAnswers: [{
    question: { type: String },
    answer: { type: String } 
  }],
  recommendedSpecialist: { 
    type: String, 
    enum: ['Optometrist', 'Ophthalmologist'],
    required: true
  }
}, { timestamps: true }); 

module.exports = mongoose.model("Symptom", symptomSchema);