// models/patient.model.js
const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, required: true, default: "user" },
  
  // NEW AVATAR FIELD:
  avatar: { 
    type: String, 
    default: "https://res.cloudinary.com/demo/image/upload/v1/default_avatar.png" // Replace with your own default image URL
  },
  
  OTP: { type: Number, default: null },
  otpExpired: { type: Date },
  isVerified: { type: Boolean, default: false },
  phone: { type: String, required: true, unique: true },
  address: { type: String, required: true },
  stripeCustomerId: { type: String, default: null } 
}, { timestamps: true });

module.exports = mongoose.model("Patient", patientSchema);