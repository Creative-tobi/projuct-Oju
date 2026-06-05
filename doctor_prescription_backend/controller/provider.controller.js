const Appointment = require("../model/appointment.model");
const sendEmail = require("../service/sendEmail");
const Doctor = require("../model/doctor.model");
// -----------------------------------------
// @route   GET /api/v1/provider/appointments
// @desc    Get all appointments for the logged-in doctor
// -----------------------------------------
exports.getDoctorQueue = async (req, res) => {
  try {
    const appointments = await Appointment.find({ specialist: req.user.id })
      .populate("patient", "fullName email phone avatar")
      .populate("symptoms", "primarySymptoms recommendedSpecialist")
      .sort({ appointmentDate: 1 }); // Ascending order

    res.status(200).json({ count: appointments.length, data: appointments });
  } catch (error) {
    console.error("Fetch Queue Error:", error);
    res
      .status(500)
      .json({ error: "Server error fetching doctor appointments." });
  }
};

// -----------------------------------------
// @route   GET /api/v1/provider/appointments/:id
// @desc    View specific appointment & deeply review Wadi Symptoms
// -----------------------------------------
exports.getAppointmentDetails = async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      specialist: req.user.id,
    })
      .populate("patient", "fullName email phone address avatar")
      .populate({
        path: "symptoms",
        select:
          "primarySymptoms investigationAnswers recommendedSpecialist createdAt",
      });

    if (!appointment) {
      return res
        .status(404)
        .json({ error: "Appointment request not found or unauthorized." });
    }

    res.status(200).json({ data: appointment });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Server error fetching appointment details." });
  }
};

// -----------------------------------------
// @route   PATCH /api/v1/provider/appointments/:id/respond
// @desc    Doctor accepts or declines a booking
// -----------------------------------------
exports.respondToBooking = async (req, res) => {
  try {
    const { action } = req.body; // Expecting 'accept' or 'decline'
    const appointmentId = req.params.id;

    if (!["accept", "decline"].includes(action)) {
      return res
        .status(400)
        .json({ error: "Invalid action. Use 'accept' or 'decline'." });
    }

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      specialist: req.user.id,
    }).populate("patient", "fullName email");

    if (!appointment)
      return res.status(404).json({ error: "Appointment not found." });

    // Allow updating if it's currently pending
    if (appointment.status !== "pending") {
      return res
        .status(400)
        .json({ error: `Appointment is already ${appointment.status}.` });
    }

    let newStatus, subject;
    const formattedDate = new Date(
      appointment.appointmentDate,
    ).toLocaleString();
    const isAccepted = action === "accept";

    newStatus = isAccepted ? "confirmed" : "cancelled";
    subject = isAccepted
      ? "Appointment Confirmed - Project Oju"
      : "Appointment Declined - Project Oju";

    appointment.status = newStatus;
    await appointment.save();

    // HTML Email Generation
    const statusColor = isAccepted ? "#28a745" : "#dc3545";
    const titleText = isAccepted
      ? "Appointment Confirmed"
      : "Appointment Declined";

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; border-top: 5px solid ${statusColor};">
        <h2 style="color: ${statusColor}; text-align: center;">${titleText}</h2>
        <p style="font-size: 16px; color: #333;">Hello ${appointment.patient.fullName},</p>
        
        ${
          isAccepted
            ? `<p style="font-size: 16px; color: #333;">Your eye care appointment has been confirmed by the clinic.</p>
             <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin: 20px 0;">
               <p style="margin: 5px 0;"><strong>Date & Time:</strong> ${formattedDate}</p>
             </div>`
            : `<p style="font-size: 16px; color: #333;">Unfortunately, the specialist had to decline your appointment request for <strong>${formattedDate}</strong> due to schedule constraints. If you made a payment, it will be refunded automatically within 3-5 business days.</p>`
        }
        
        <p style="font-size: 14px; color: #666;">Stay healthy,<br/><strong>The Oju Team</strong></p>
      </div>
    `;

    await sendEmail({
      to: appointment.patient.email,
      subject,
      text: `Your appointment status was updated to: ${newStatus}`,
      html: emailHtml,
    });

    res.status(200).json({
      message: `Appointment ${newStatus} successfully. Patient notified.`,
      data: appointment,
    });
  } catch (error) {
    console.error("Respond Booking Error:", error);
    res.status(500).json({ error: "Server error responding to booking." });
  }
};
// -----------------------------------------
// @route   PUT /api/v1/provider/schedule
// @desc    Doctor updates their availability/schedule
// -----------------------------------------
exports.updateSchedule = async (req, res) => {
  try {
    const { days, startTime, endTime } = req.body;

    // Validate the input
    if (!days || !Array.isArray(days)) {
      return res.status(400).json({ error: "Please provide an array of working days." });
    }

    // Find the logged-in doctor
    const doctor = await Doctor.findById(req.user.id);

    if (!doctor) {
      return res.status(404).json({ error: "Doctor profile not found." });
    }

    // Update the availability object
    doctor.availability = {
      days,
      startTime: startTime || doctor.availability.startTime,
      endTime: endTime || doctor.availability.endTime
    };

    await doctor.save();

    res.status(200).json({
      message: "Schedule updated successfully.",
      availability: doctor.availability
    });

  } catch (error) {
    console.error("Update Schedule Error:", error);
    res.status(500).json({ error: "Server error updating schedule." });
  }
};
