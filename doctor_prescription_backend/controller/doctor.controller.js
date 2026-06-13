const Doctor = require("../model/doctor.model");
const Appointment = require("../model/appointment.model"); // Make sure this is required at the top of the file


// -----------------------------------------
// @route   GET /api/v1/doctors
// @desc    Get all verified doctors (with geospatial search)
// -----------------------------------------
exports.getAllDoctors = async (req, res) => {
  try {
    // We expect the frontend to pass longitude (lng) and latitude (lat) in the URL query
    // Example: /api/v1/doctors?lng=3.4064&lat=6.4281&speciality=Ophthalmologist
    const { speciality, lng, lat, maxDistance = 15000 } = req.query; // Default max distance: 15km

    // Base query: Only show doctors who are fully verified and approved
    let query = { isVerified: true };

    // Filter by Wadi recommendation if provided
    if (speciality) {
      query.speciality = speciality;
    }

    // If the patient's browser provides GPS coordinates, sort by nearest
    if (lng && lat) {
      query.location = {
        $near: {
          $geometry: {
            type: "Point",
            // MongoDB strictly requires [longitude, latitude] order
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: parseInt(maxDistance),
        },
      };
    }

    // Fetch the doctors but hide sensitive backend data
    const doctors = await Doctor.find(query).select(
      "fullName profilePicture clinicName speciality consultationFee address qualifications location availability",
    );

    res.status(200).json({ count: doctors.length, data: doctors });
  } catch (error) {
    console.error("Doctor Search Error:", error);
    res.status(500).json({ error: "Server error fetching doctors." });
  }
};

// -----------------------------------------
// @route   GET /api/v1/doctors/:id
// @desc    Get a specific doctor's full public profile
// -----------------------------------------
exports.getDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).select(
      "-password -OTP -otpExpired -role -stripeCustomerId",
    );

    if (!doctor || !doctor.isApprovedByAdmin) {
      return res
        .status(404)
        .json({ error: "Doctor not found or not currently active." });
    }

    res.status(200).json({ data: doctor });
  } catch (error) {
    console.error("Fetch Doctor Profile Error:", error);
    res.status(500).json({ error: "Server error fetching doctor profile." });
  }
};
// Helper: Generate time slots based on start/end time (e.g., "09:00" to "17:00")
function generateTimeSlots(startTime, endTime, durationMins = 60) {
  const slots = [];
  const [sH, sM] = startTime.split(":").map(Number);
  const [eH, eM] = endTime.split(":").map(Number);

  let current = sH * 60 + sM;
  const end = eH * 60 + eM;

  while (current < end) {
    const h = Math.floor(current / 60);
    const m = current % 60;
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    slots.push(`${h12}:${m.toString().padStart(2, "0")} ${ampm}`);
    current += durationMins;
  }
  return slots;
}


// -----------------------------------------
// @route   GET /api/v1/patient/doctors/:id/slots?date=YYYY-MM-DD
// @desc    Get available time slots for a specific doctor on a specific date
// -----------------------------------------
exports.getAvailableSlots = async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query; // Expected format: YYYY-MM-DD

    if (!date)
      return res
        .status(400)
        .json({ error: "Date query parameter is required." });

    const doctor = await Doctor.findById(id);
    if (!doctor) return res.status(404).json({ error: "Doctor not found." });

    // Check if doctor has availability set
    if (
      !doctor.availability ||
      !doctor.availability.days ||
      doctor.availability.days.length === 0
    ) {
      return res
        .status(200)
        .json({
          availableSlots: [],
          bookedSlots: [],
          message: "Doctor hasn't set their schedule yet.",
        });
    }

    // Determine the day of the week for the selected date (Using UTC to prevent timezone shifting)
    const dateObj = new Date(date + "T00:00:00Z");
    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const dayName = daysOfWeek[dateObj.getUTCDay()];

    // 1. Check if doctor works on this day
    if (!doctor.availability.days.includes(dayName)) {
      return res
        .status(200)
        .json({
          availableSlots: [],
          bookedSlots: [],
          message: `Doctor is not available on ${dayName}.`,
        });
    }

    // 2. Generate all possible slots for the day
    const interval = doctor.availability.interval || 30; // Default 30 mins if not set in DB
    const startTime = doctor.availability.startTime || "09:00";
    const endTime = doctor.availability.endTime || "17:00";

    const generateSlots = (start, end, intervalMins) => {
      const slots = [];
      let [startH, startM] = start.split(":").map(Number);
      let [endH, endM] = end.split(":").map(Number);

      let current = startH * 60 + startM;
      const endTotal = endH * 60 + endM;

      while (current < endTotal) {
        const h = Math.floor(current / 60);
        const m = current % 60;
        const ampm = h >= 12 ? "PM" : "AM";
        const h12 = h % 12 || 12;
        slots.push(`${h12}:${m.toString().padStart(2, "0")} ${ampm}`); // e.g., "8:00 AM", "8:30 AM"
        current += intervalMins;
      }
      return slots;
    };

    const allSlots = generateSlots(startTime, endTime, interval);

    // 3. Fetch already booked appointments for this doctor on this date
    const startOfDay = new Date(date + "T00:00:00.000Z");
    const endOfDay = new Date(date + "T23:59:59.999Z");

    const bookedAppointments = await Appointment.find({
      specialist: id,
      appointmentDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ["pending", "confirmed"] }, // Ignore cancelled/completed
    }).select("time");

    const bookedTimes = bookedAppointments.map((apt) => apt.time);

    // 4. Filter out booked slots
    const availableSlots = allSlots.filter(
      (slot) => !bookedTimes.includes(slot),
    );

    res.status(200).json({
      date,
      day: dayName,
      allSlots,
      availableSlots,
      bookedSlots: bookedTimes,
    });
  } catch (error) {
    console.error("Fetch Slots Error:", error);
    res.status(500).json({ error: "Server error fetching available slots." });
  }
};