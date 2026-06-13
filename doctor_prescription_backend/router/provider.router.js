const express = require("express");
const router = express.Router();
const providerController = require("../controller/provider.controller");
const { protect } = require("../middleware/auth.middleware");
const { requireRole } = require("../middleware/role.middleware");
const symptomsController = require("../controller/symptoms.controller");

router.use(protect);
router.use(requireRole("doctor"));

router.get("/appointments", providerController.getDoctorQueue);
router.get("/appointments/:id", providerController.getAppointmentDetails);
router.patch("/appointments/:id/respond", providerController.respondToBooking);
router.put("/schedule", providerController.updateSchedule);

// ADD THESE NEW ROUTES:
router.get("/triage", providerController.getTriageCases);
router.get("/patients", providerController.getDoctorPatients);
router.patch("/triage/:id/review", providerController.reviewTriageCase);

router.patch("/triage/:id/review", symptomsController.reviewAssessment);

module.exports = router;
