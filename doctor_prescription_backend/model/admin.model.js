// models/admin.model.js
const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, default: "admin" },
  
  // NEW AVATAR FIELD:
  avatar: { type: String, default: null }
  
}, { timestamps: true });

module.exports = mongoose.model("Admin", adminSchema);