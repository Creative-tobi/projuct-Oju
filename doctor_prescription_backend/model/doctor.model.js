const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "doctor" },
    phone: { type: String },
    address: { type: String },
    profilePicture: { type: String }, // For image uploads

    // 🔴 Doctor-Specific Fields
    speciality: { type: String },
    clinicName: { type: String },
    consultationFee: { type: Number },
    qualifications: { type: String },
    experience: { type: String }, // Can be String or Number

    // Auth & Verification
    isVerified: { type: Boolean, default: false },
    OTP: { type: Number },
    otpExpired: { type: Date },

    // Availability (for scheduling)
    availability: {
      days: [{ type: String }],
      startTime: { type: String },
      endTime: { type: String },
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Doctor", doctorSchema);
