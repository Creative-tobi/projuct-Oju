const jwt = require("jsonwebtoken");
const Doctor = require("../model/doctor.model");
const Patient = require("../model/patient.model");
const Appointment = require("../model/appointment.model");
const ActivityLog = require("../model/activityLog.model");

// Helper to log admin actions
const logAction = async (adminId, action, targetType, targetId, details) => {
  await ActivityLog.create({ adminId, action, targetType, targetId, details });
};

// -----------------------------------------
// @route   POST /api/v1/admin/login
// @desc    Admin Login
// -----------------------------------------
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    // For security, use environment variables for admin credentials or an Admin model
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@projectoju.com";
    const ADMIN_PASS = process.env.ADMIN_PASSWORD || "Admin@123";

    if (email !== ADMIN_EMAIL || password !== ADMIN_PASS) {
      return res.status(401).json({ error: "Invalid admin credentials." });
    }

    const token = jwt.sign(
      { id: "admin_001", role: "admin" },
      process.env.JWT_SECRET || "your_super_secret_jwt_key",
      { expiresIn: "1d" },
    );

    res.status(200).json({
      message: "Admin login successful",
      token,
      user: { fullName: "System Administrator", role: "admin", email },
    });
  } catch (error) {
    res.status(500).json({ error: "Server error during admin login." });
    console.error("Admin Login Error:", error);
  }
};

// -----------------------------------------
// @route   GET /api/v1/admin/dashboard-stats
// @desc    Get overview statistics
// -----------------------------------------
exports.getDashboardStats = async (req, res) => {
  try {
    const totalDoctors = await Doctor.countDocuments();
    const pendingDoctors = await Doctor.countDocuments({
      isApprovedByAdmin: false,
    });
    const totalPatients = await Patient.countDocuments();
    const totalAppointments = await Appointment.countDocuments();

    res.status(200).json({
      totalDoctors,
      pendingDoctors,
      totalPatients,
      totalAppointments,
    });
    await logAction(
      req.user.id,
      "VIEWED_DASHBOARD",
      "System",
      null,
      "Viewed admin dashboard stats",
    );
  } catch (error) {
    res.status(500).json({ error: "Server error fetching stats." });
  }
};

// -----------------------------------------
// @route   GET /api/v1/admin/doctors
// @desc    Get all doctors (for approval/management)
// -----------------------------------------
exports.getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find()
      .select("-password -OTP -otpExpired")
      .sort({ createdAt: -1 });
    res.status(200).json({ count: doctors.length, data: doctors });
  } catch (error) {
    res.status(500).json({ error: "Server error fetching doctors." });
  }
};

// -----------------------------------------
// @route   PATCH /api/v1/admin/doctors/:id/approve
// @desc    Approve or Reject a doctor
// -----------------------------------------
exports.approveDoctor = async (req, res) => {
  try {
    const { isApproved } = req.body; // true or false
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { isApprovedByAdmin: isApproved },
      { new: true },
    );

    if (!doctor) return res.status(404).json({ error: "Doctor not found." });

    await logAction(
      req.user.id,
      isApproved ? "APPROVED_DOCTOR" : "REJECTED_DOCTOR",
      "Doctor",
      doctor._id,
      `Doctor ${doctor.fullName} was ${isApproved ? "approved" : "rejected"}`,
    );

    res
      .status(200)
      .json({
        message: `Doctor ${isApproved ? "approved" : "rejected"} successfully.`,
        data: doctor,
      });
  } catch (error) {
    res.status(500).json({ error: "Server error updating doctor status." });
  }
};

// -----------------------------------------
// @route   GET /api/v1/admin/appointments
// @desc    Get all appointments system-wide
// -----------------------------------------
exports.getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate("patient", "fullName email")
      .populate("specialist", "fullName speciality")
      .sort({ appointmentDate: -1 });

    res.status(200).json({ count: appointments.length, data: appointments });
    await logAction(
      req.user.id,
      "VIEWED_ALL_APPOINTMENTS",
      "System",
      null,
      "Viewed all system appointments",
    );
  } catch (error) {
    res.status(500).json({ error: "Server error fetching appointments." });
  }
};

// -----------------------------------------
// @route   DELETE /api/v1/admin/delete-account/:id
// @desc    Delete a user or doctor account
// -----------------------------------------
exports.deleteAccount = async (req, res) => {
  try {
    const { role } = req.body; // 'user' or 'doctor'
    const Model = role === "doctor" ? Doctor : Patient;

    const deletedItem = await Model.findByIdAndDelete(req.params.id);
    if (!deletedItem)
      return res.status(404).json({ error: "Account not found." });

    await logAction(
      req.user.id,
      "DELETED_ACCOUNT",
      role === "doctor" ? "Doctor" : "Patient",
      req.params.id,
      `Deleted ${role} account: ${deletedItem.fullName}`,
    );

    res.status(200).json({ message: "Account deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: "Server error deleting account." });
  }
};

// -----------------------------------------
// @route   GET /api/v1/admin/activity-logs
// @desc    Get system activity logs for monitoring
// -----------------------------------------
exports.getActivityLogs = async (req, res) => {
  try {
    const logs = await ActivityLog.find().sort({ createdAt: -1 }).limit(100); // Keep it to the last 100 actions for performance

    res.status(200).json({ count: logs.length, data: logs });
  } catch (error) {
    res.status(500).json({ error: "Server error fetching activity logs." });
  }
};
