const express = require("express");
const router = express.Router();
const profileController = require("../controller/profile.controller");
const { protect } = require("../middleware/auth.middleware");
const { upload } = require("../config/cloudinary");

// All profile routes require the user to be logged in
router.use(protect);

router.get("/me", profileController.getProfile);
router.put("/update", profileController.updateProfile);

// The upload.single middleware catches the file, sends it to Cloudinary,
// and attaches the result to req.file before hitting the controller
router.patch("/avatar", upload.single("image"), profileController.uploadAvatar);

module.exports = router;
