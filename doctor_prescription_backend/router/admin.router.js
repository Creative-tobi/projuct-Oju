const express = require("express");
const router = express.Router();
const adminController = require("../controller/admin.controller");
const { protect } = require("../middleware/auth.middleware");
const { requireRole } = require("../middleware/role.middleware");

// Public admin route
router.post("/login", adminController.adminLogin);

// Require JWT and Admin Role
router.use(protect);
router.use(requireRole("admin"));

router.get("/appointments", adminController.getAllAppointments);
router.patch("/doctors/:id/approve", adminController.approveDoctor);
router.delete("/delete-account", adminController.deleteAccount);

module.exports = router;
