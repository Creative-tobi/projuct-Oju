const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Appointment = require("../model/appointment.model");
const Doctor = require("../model/doctor.model");
const sendEmail = require("../service/sendEmail");

// -----------------------------------------
// @route   POST /api/v1/patient/book
// @desc    Book appointment & generate Stripe Checkout URL
// -----------------------------------------
exports.bookAppointment = async (req, res) => {
  try {
    const { specialistId, symptomLogId, appointmentDate } = req.body;

    if (!specialistId || !appointmentDate) {
      return res
        .status(400)
        .json({ error: "Specialist ID and date are required." });
    }

    // 1. Fetch the doctor to get their consultation fee
    const doctor = await Doctor.findById(specialistId);
    if (!doctor || !doctor.isApprovedByAdmin) {
      return res
        .status(404)
        .json({ error: "Doctor not found or unavailable." });
    }

    // 2. Prevent double booking for this exact slot
    // ... inside exports.bookAppointment ...

  
    const existingBooking = await Appointment.findOne({
      specialist: doctorId,
      appointmentDate: new Date(appointmentDate),
      time: time,
      status: { $in: ["pending", "confirmed"] },
    });

    if (existingBooking) {
      return res.status(400).json({
        error:
          "This time slot was just booked by another patient. Please select a different time.",
      });
    }

    // ... proceed to create the appointment ...

    // 3. Create a pending appointment in the database
    const newAppointment = await Appointment.create({
      patient: req.user.id,
      specialist: specialistId,
      symptoms: symptomLogId || null,
      appointmentDate,
      status: "pending",
      paymentStatus: "unpaid",
    });

    // 4. Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer_email: req.user.email, // Auto-fills the Stripe form
      line_items: [
        {
          price_data: {
            currency: "ngn", // Change to usd, gbp, etc. depending on your market
            product_data: {
              name: `Eye Consultation with Dr. ${doctor.fullName}`,
              description: `${doctor.speciality} at ${doctor.clinicName}`,
            },
            unit_amount: doctor.consultationFee * 100, // Stripe expects amounts in cents/kobo
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      // Stripe redirects here after success or cancellation
      success_url: `https://projectoju.com/booking/success?appointment_id=${newAppointment._id}`,
      cancel_url: `https://projectoju.com/booking/cancel?appointment_id=${newAppointment._id}`,
      // Pass the appointment ID so Stripe remembers what this payment is for
      metadata: {
        appointmentId: newAppointment._id.toString(),
      },
    });

    res.status(201).json({
      message: "Booking initiated. Redirecting to secure checkout.",
      checkoutUrl: session.url, // React frontend redirects the user to this URL
      data: newAppointment,
    });
  } catch (error) {
    console.error("Booking Error:", error);
    res.status(500).json({ error: "Server error during booking process." });
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
