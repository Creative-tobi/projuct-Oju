const express = require("express");
const router = express.Router();
const doctorController = require("../controller/doctor.controller");

// Public routes for finding doctors (no auth required for search)
router.get("/", doctorController.getAllDoctors);
router.get("/:id", doctorController.getDoctorProfile);
router.get("/:id/slots", doctorController.getAvailableSlots);

module.exports = router;
