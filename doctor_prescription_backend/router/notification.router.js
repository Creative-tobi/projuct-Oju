const express = require("express");
const router = express.Router();
const notificationController = require("../controller/notification.controller");
const { protect } = require("../middleware/auth.middleware");

router.use(protect); // All notification routes require login
router.get("/", notificationController.getMyNotifications);
router.patch("/read-all", notificationController.markAllAsRead);

module.exports = router;
