const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipientId: { type: mongoose.Schema.Types.ObjectId, required: true },
    recipientRole: { type: String, enum: ["user", "doctor"], required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: [
        "booking_request",
        "booking_confirmed",
        "booking_declined",
        "system",
      ],
      required: true,
    },
    isRead: { type: Boolean, default: false },
    relatedAppointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Notification", notificationSchema);
