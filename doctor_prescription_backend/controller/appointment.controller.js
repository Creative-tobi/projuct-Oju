const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Appointment = require("../model/appointment.model");
const Doctor = require("../model/doctor.model");
const sendEmail = require("../service/sendEmail");
const Patient = require("../model/patient.model");
const { createNotification } = require("./notification.controller");


// -----------------------------------------
exports.bookAppointment = async (req, res) => {
  try {
    console.log("📅 BOOKING REQUEST RECEIVED:", req.body);
    console.log("👤 PATIENT ID:", req.user.id);

    const { specialist, specialistId, appointmentDate, time, type } = req.body;
    const doctorId = specialist || specialistId;

    if (!doctorId || !appointmentDate || !time) {
      return res
        .status(400)
        .json({ error: "Specialist ID, date, and time are required." });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found." });
    }

    // Safely parse the date to prevent Mongoose Cast Errors
    const parsedDate = new Date(appointmentDate + "T00:00:00.000Z");
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ error: "Invalid date format." });
    }

    // Check double booking
    const startOfDay = new Date(appointmentDate + "T00:00:00.000Z");
    const endOfDay = new Date(appointmentDate + "T23:59:59.999Z");

    const existingBooking = await Appointment.findOne({
      specialist: doctorId,
      appointmentDate: { $gte: startOfDay, $lte: endOfDay },
      time: time,
      status: { $in: ["pending", "confirmed"] },
    });

    if (existingBooking) {
      console.log("⚠️ DOUBLE BOOKING ATTEMPTED FOR:", time);
      return res
        .status(400)
        .json({
          error: "This time slot is already booked. Please select another.",
        });
    }

    // 🔴 IMPORTANT: Only include fields that exist in your Appointment model!
    // If your model requires 'clinicName', 'fee', or 'location', add them here, otherwise Mongoose will crash.
    const newAppointment = await Appointment.create({
      patient: req.user.id,
      specialist: doctorId,
      appointmentDate: parsedDate,
      time: time,
      type: type || "Online Video Consult",
      status: "pending", // or "confirmed"
      // paymentStatus: "unpaid", // Uncomment if your schema has this
    });

    console.log("✅ APPOINTMENT SAVED TO DB:", newAppointment._id);

    res.status(201).json({
      message: "Booking placed successfully!",
      data: newAppointment,
    });

    // Notify the Doctor
    const patient = await Patient.findById(req.user.id);
    const patientName = patient ? patient.fullName : "A patient";

    await createNotification(
      doctorId,
      "doctor",
      `New booking request from ${patientName} for ${parsedDate.toLocaleDateString()} at ${time}.`,
      "booking_request",
      newAppointment._id,
    );
  } catch (error) {
    console.error("❌ BOOKING CRASHED:", error);
    
    // Catch Mongoose Validation Errors specifically and send them to the frontend
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ error: `Validation failed: ${messages.join(", ")}` });
    }

    if (error.name === "CastError") {
      return res.status(400).json({ error: `Invalid ID format: ${error.message}` });
    }

    res.status(500).json({ error: "Server error while booking. Check backend terminal for details." });
  }
};

// -----------------------------------------
// @route   POST /api/v1/patient/verify-payment
// @desc    Manual verification fallback after Stripe redirect
// -----------------------------------------
exports.verifyPayment = async (req, res) => {
  try {
    const { appointmentId } = req.body;

    const appointment =
      await Appointment.findById(appointmentId).populate("patient specialist");
    if (!appointment)
      return res.status(404).json({ error: "Appointment not found." });

    if (appointment.paymentStatus === "paid") {
      return res
        .status(200)
        .json({ message: "Payment already verified.", data: appointment });
    }

    // Since we didn't set up Webhooks yet, we simulate the success check here
    // for the MVP when the user lands on the success_url.
    // In production, Stripe Webhooks handle this autonomously in the background.

    appointment.paymentStatus = "paid";
    appointment.status = "confirmed"; // The doctor can still decline/reschedule later
    await appointment.save();

    // Fire the confirmation email
    const formattedDate = new Date(
      appointment.appointmentDate,
    ).toLocaleString();
    await sendEmail({
      to: appointment.patient.email,
      subject: "Appointment Confirmed - Project Oju",
      text: `Your appointment with Dr. ${appointment.specialist.fullName} on ${formattedDate} is confirmed.`,
      html: `<h3>Booking Confirmed</h3><p>Your payment was successful. See you on ${formattedDate} at ${appointment.specialist.clinicName}.</p>`,
    });

    res
      .status(200)
      .json({
        message: "Payment verified and appointment confirmed.",
        data: appointment,
      });
  } catch (error) {
    console.error("Verification Error:", error);
    res.status(500).json({ error: "Server error verifying payment." });
  }
};

// -----------------------------------------
// @route   GET /api/v1/patient/appointments
// @desc    Get patient's booking history
// -----------------------------------------
exports.getPatientAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ patient: req.user.id })
      .populate("specialist", "fullName profilePicture clinicName address")
      .populate("symptoms", "primarySymptoms recommendedSpecialist")
      .sort({ appointmentDate: 1 }); // Ascending order (upcoming first)

    res.status(200).json({ count: appointments.length, data: appointments });
  } catch (error) {
    res.status(500).json({ error: "Server error fetching appointments." });
  }
};
