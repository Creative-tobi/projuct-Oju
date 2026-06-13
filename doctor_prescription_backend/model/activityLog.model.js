const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    action: { type: String, required: true }, // e.g., "APPROVED_DOCTOR", "DELETED_USER", "VIEWED_APPOINTMENTS"
    targetType: {
      type: String,
      enum: ["Doctor", "Patient", "Appointment", "System"],
    },
    targetId: { type: mongoose.Schema.Types.ObjectId },
    details: { type: String },
  },
  { timestamps: true },
);

module.exports = mongoose.model("ActivityLog", activityLogSchema);
