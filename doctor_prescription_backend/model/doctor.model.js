// models/doctor.model.js
const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, required: true, default: "doctor" },

    // NEW PROFILE PICTURE FIELD:
    profilePicture: {
      type: String,
      default:
        "https://res.cloudinary.com/demo/image/upload/v1/default_doctor.png", // Replace with a generic doctor silhouette
    },

    OTP: { type: Number, default: null },
    otpExpired: { type: Date },
    isVerified: { type: Boolean, default: false },
    isApprovedByAdmin: { type: Boolean, default: false },

    phone: { type: String, required: true, unique: true },
    address: { type: String, required: true },
    clinicName: { type: String, required: true },
    speciality: {
      type: String,
      enum: ["Optometrist", "Ophthalmologist"],
      required: true,
    },
    availability: {
      days: [
        {
          type: String,
          enum: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ],
        },
      ],
      startTime: { type: String, default: "09:00" }, // e.g., "09:00"
      endTime: { type: String, default: "17:00" }, // e.g., "17:00"
    },
    consultationFee: { type: Number, required: true },
    qualifications: { type: [String], required: true },

    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], index: "2dsphere" },
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Doctor", doctorSchema);