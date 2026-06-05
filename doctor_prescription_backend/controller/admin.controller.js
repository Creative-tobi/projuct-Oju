const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Admin = require("../model/admin.model");
const Doctor = require("../model/doctor.model");
const Patient = require("../model/patient.model");
const Appointment = require("../model/appointment.model");
const sendEmail = require("../service/sendEmail");

// -----------------------------------------
// @route   POST /api/v1/admin/login
// @desc    Secure Admin Login
// -----------------------------------------
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin)
      return res.status(401).json({ error: "Invalid admin credentials." });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch)
      return res.status(401).json({ error: "Invalid admin credentials." });

    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET || "your_super_secret_jwt_key",
      { expiresIn: "12h" },
    );

    res.status(200).json({
      message: "Admin login successful",
      token,
      admin: { id: admin._id, email: admin.email, fullName: admin.fullName },
    });
  } catch (error) {
    res.status(500).json({ error: "Server error during admin login." });
  }
};

// -----------------------------------------
// @route   GET /api/v1/admin/appointments
// @desc    View all platform appointments
// -----------------------------------------
exports.getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate("patient", "fullName email")
      .populate("specialist", "fullName clinicName")
      .sort({ createdAt: -1 });

    res.status(200).json({ count: appointments.length, data: appointments });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Server error fetching platform appointments." });
  }
};

// -----------------------------------------
// @route   PATCH /api/v1/admin/doctors/:id/approve
// @desc    Verify doctor and send approval email
// -----------------------------------------
exports.approveDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });

    if (doctor.isApprovedByAdmin) {
      return res.status(400).json({ error: "Doctor is already approved." });
    }

    doctor.isApprovedByAdmin = true;
    await doctor.save();

    const approvalHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; border-top: 5px solid #28a745;">
        <h2 style="color: #28a745; text-align: center;">Account Approved</h2>
        <p style="font-size: 16px; color: #333;">Hello Dr. ${doctor.fullName},</p>
        <p style="font-size: 16px; color: #333;">Our administrative team has successfully verified your medical credentials.</p>
        <p style="font-size: 16px; color: #333;">You are now officially active on Project Oju as a verified <strong>${doctor.speciality}</strong>. Patients can now discover your clinic.</p>
      </div>
    `;

    await sendEmail({
      to: doctor.email,
      subject: "Your Project Oju Specialist Account is Approved!",
      text: `Hello ${doctor.fullName}, your credentials are verified. You are now active on Project Oju.`,
      html: approvalHtml,
    });

    res
      .status(200)
      .json({ message: "Doctor verified successfully and email dispatched." });
  } catch (error) {
    res.status(500).json({ error: "Server error approving doctor." });
  }
};

// -----------------------------------------
// @route   DELETE /api/v1/admin/delete-account
// @desc    Admin deletes any user or doctor account
// -----------------------------------------
exports.deleteAccount = async (req, res) => {
  try {
    const { accountId, role } = req.body;

    if (!accountId || !role) {
      return res
        .status(400)
        .json({
          error: "Account ID and role ('doctor' or 'user') are required.",
        });
    }

    const Model = role === "doctor" ? Doctor : Patient;
    const deletedAccount = await Model.findByIdAndDelete(accountId);

    if (!deletedAccount)
      return res.status(404).json({ error: "Account not found." });

    // Clean up orphaned appointments
    if (role === "doctor") {
      await Appointment.deleteMany({ specialist: accountId });
    } else {
      await Appointment.deleteMany({ patient: accountId });
    }

    res
      .status(200)
      .json({
        message: `${role} account and associated appointments deleted.`,
      });
  } catch (error) {
    res.status(500).json({ error: "Server error deleting account." });
  }
};
