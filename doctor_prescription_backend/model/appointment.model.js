const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    specialist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    symptoms: {
      type: mongoose.Schema.Types.ObjectId, // Links to the assessment log
      ref: "Symptom",
    },
    appointmentDate: {
      type: Date,
      required: true,
    },

    // CLINICAL STATUS:
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },

    // STRIPE PAYMENT STATUS:
    paymentStatus: {
      type: String,
      enum: ["unpaid", "processing", "paid", "refunded", "failed"],
      default: "unpaid",
    },
    stripePaymentIntentId: { type: String, default: null },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Appointment", appointmentSchema);
