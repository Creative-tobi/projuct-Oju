const express = require("express");
const router = express.Router();
const providerController = require("../controller/provider.controller");
const { protect } = require("../middleware/auth.middleware");
const { requireRole } = require("../middleware/role.middleware");

// Require JWT and Doctor Role
router.use(protect);
router.use(requireRole("doctor"));

router.get("/appointments", providerController.getDoctorQueue);
router.get("/appointments/:id", providerController.getAppointmentDetails);
router.patch("/appointments/:id/respond", providerController.respondToBooking);
router.put("/schedule", providerController.updateSchedule);

module.exports = router;
