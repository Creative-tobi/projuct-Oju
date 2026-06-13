const express = require("express");
const router = express.Router();
const doctorController = require("../controller/doctor.controller");
const { protect } = require("../middleware/auth.middleware");

const symptomController = require("../controller/symptoms.controller");
const appointmentController = require("../controller/appointment.controller");

router.get("/doctors", doctorController.getAllDoctors);
router.get("/doctors/:id", doctorController.getDoctorProfile);



// All routes require the patient to be logged in
router.use(protect);

router.post("/assessment", symptomController.submitAssessment);
router.get("/assessment/history", symptomController.getAssessmentHistory);

router.post("/book", appointmentController.bookAppointment);
router.post("/verify-payment", appointmentController.verifyPayment);
router.get("/appointments", appointmentController.getPatientAppointments);

// Doctor Discovery Routes
router.get("/doctors/:id/slots", doctorController.getAvailableSlots);

module.exports = router;
