const Doctor = require("../model/doctor.model");
const Patient = require("../model/patient.model");

const getModelByRole = (role) => {
  return role === "doctor" ? Doctor : Patient;
};

// -----------------------------------------
// @route   GET /api/v1/profile/me
// @desc    Get current user's profile
// -----------------------------------------
exports.getProfile = async (req, res) => {
  try {
    const UserModel = getModelByRole(req.user.role);

    // Exclude highly sensitive fields from being sent to the client
    const user = await UserModel.findById(req.user.id).select(
      "-password -OTP -otpExpired",
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ data: user });
  } catch (error) {
    console.error("Get Profile Error:", error);
    res.status(500).json({ error: "Server Error fetching profile" });
  }
};

// -----------------------------------------
// @route   PUT /api/v1/profile/update
// @desc    Update text-based profile fields
// -----------------------------------------
exports.updateProfile = async (req, res) => {
  try {
    const UserModel = getModelByRole(req.user.role);

    // Security: Extract and discard fields the user shouldn't update manually
    const {
      email,
      password,
      role,
      isVerified,
      isApprovedByAdmin,
      stripeCustomerId,
      _id,
      ...updateData
    } = req.body;

    const updatedUser = await UserModel.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true, runValidators: true },
    ).select("-password -OTP -otpExpired");

    res.status(200).json({
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ error: "Server Error updating profile" });
  }
};

// -----------------------------------------
// @route   PATCH /api/v1/profile/avatar
// @desc    Upload and update profile picture
// -----------------------------------------
exports.uploadAvatar = async (req, res) => {
  try {
    // req.file is injected by the Multer middleware
    if (!req.file) {
      return res.status(400).json({ error: "Please upload an image file." });
    }

    const UserModel = getModelByRole(req.user.role);

    // Determine the correct field name based on schema (Patient = avatar, Doctor = profilePicture)
    const imageField = req.user.role === "doctor" ? "profilePicture" : "avatar";

    // Update the specific image field with the secure Cloudinary URL (req.file.path)
    const updatedUser = await UserModel.findByIdAndUpdate(
      req.user.id,
      { [imageField]: req.file.path },
      { new: true },
    ).select("-password -OTP -otpExpired");

    res.status(200).json({
      message: "Profile picture updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Avatar Upload Error:", error);
    res.status(500).json({ error: "Server Error uploading avatar" });
  }
};
