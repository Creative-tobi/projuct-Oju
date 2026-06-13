const express = require("express");
const router = express.Router();
const adminController = require("../controller/admin.controller");
const { protect } = require("../middleware/auth.middleware");
const { requireRole } = require("../middleware/role.middleware");

// Public admin route
router.post("/login", adminController.adminLogin);

// Require JWT and Admin Role for all routes below
router.use(protect);
router.use(requireRole("admin"));

router.get("/dashboard-stats", adminController.getDashboardStats);
router.get("/doctors", adminController.getAllDoctors);
router.patch("/doctors/:id/approve", adminController.approveDoctor);
router.get("/appointments", adminController.getAllAppointments);
router.delete("/delete-account/:id", adminController.deleteAccount);
router.get("/activity-logs", adminController.getActivityLogs);

module.exports = router;
