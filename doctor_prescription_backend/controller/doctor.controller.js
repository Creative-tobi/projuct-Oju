const Doctor = require("../model/doctor.model");

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
    let query = { isVerified: true, isApprovedByAdmin: true };

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
