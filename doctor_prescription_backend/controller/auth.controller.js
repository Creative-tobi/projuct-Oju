const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Patient = require("../model/patient.model");
const Doctor = require("../model/doctor.model");
const sendEmail = require("../service/sendEmail");

// Helper function to dynamically select the right Mongoose model
const getModelByRole = (role) => {
  return role === "doctor" ? Doctor : Patient;
};

// -----------------------------------------
// @route   POST /api/v1/auth/register
// @desc    Register a new Patient or Doctor (with explicit model fields & optional image)
// -----------------------------------------
exports.register = async (req, res) => {
  try {
    // 1. Explicitly destructure expected fields from req.body
    const {
      email,
      password,
      role,
      fullName,
      phone,
      address,
      // Doctor-specific fields
      speciality,
      clinicName,
      consultationFee,
      qualifications,
      experience,
    } = req.body;

    const UserModel = getModelByRole(role);

    // 2. Check if user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "An account with this email already exists." });
    }

    // 3. Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Generate 6-digit OTP
    const generatedOTP = Math.floor(100000 + Math.random() * 900000);
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // 5. Build the user data object with explicit fields
    const userData = {
      email,
      password: hashedPassword,
      role: role || "user",
      fullName,
      phone,
      address,
      OTP: generatedOTP,
      otpExpired: otpExpiry,
    };

    // Conditionally add doctor-specific fields to the payload
    if (role === "doctor") {
      userData.speciality = speciality;
      userData.clinicName = clinicName;
      userData.consultationFee = consultationFee;
      userData.qualifications = qualifications;
      userData.experience = experience;
    }

    const newUser = new UserModel(userData);

    // 6. Handle Image Upload (if Multer/Cloudinary middleware is attached to the route)
    if (req.file) {
      // Patient model uses 'avatar', Doctor model uses 'profilePicture'
      const imageField = role === "doctor" ? "profilePicture" : "avatar";
      newUser[imageField] = req.file.path;
    }

    await newUser.save();

    // 7. Send OTP Email (HTML Formatted)
    const otpTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #0056b3; text-align: center;">Verify Your Account</h2>
        <p style="font-size: 16px; color: #333;">Hello ${fullName || "User"},</p>
        <p style="font-size: 16px; color: #333;">Thank you for registering. Please use the verification code below to activate your account:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="display: inline-block; font-size: 24px; font-weight: bold; color: #ffffff; background-color: #0056b3; padding: 12px 24px; border-radius: 6px; letter-spacing: 2px;">
            ${generatedOTP}
          </span>
        </div>
        <p style="font-size: 14px; color: #666;">This code expires in 10 minutes.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #999; text-align: center;">&copy; ${new Date().getFullYear()} Project Oju Vision Care.</p>
      </div>
    `;

    await sendEmail({
      to: newUser.email,
      subject: "Verify Your Project Oju Account",
      text: `Your verification OTP is: ${generatedOTP}. It expires in 10 minutes.`,
      html: otpTemplate,
    });

    res.status(201).json({
      message: "Registration successful. Please check your email for the OTP.",
    });
    // console.log(OTP);
    
  } catch 
  (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ error: "Server error during registration." });
  }
};

// -----------------------------------------
// @route   POST /api/v1/auth/verify-otp
// @desc    Verify email using OTP & Send Welcome Email
// -----------------------------------------
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp, role } = req.body;
    const UserModel = getModelByRole(role);

    const user = await UserModel.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found." });

    if (user.OTP !== parseInt(otp)) {
      return res.status(400).json({ error: "Invalid OTP." });
    }

    if (new Date() > user.otpExpired) {
      return res
        .status(400)
        .json({ error: "OTP has expired. Please request a new one." });
    }

    // Verify User
    user.isVerified = true;
    user.OTP = null;
    user.otpExpired = null;
    await user.save();

    // Send Welcome Email (HTML Formatted)
    const welcomeTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #0056b3; text-align: center;">Welcome to Project Oju! 🎉</h2>
        <p style="font-size: 16px; color: #333;">Hello ${user.fullName || "User"},</p>
        <p style="font-size: 16px; color: #333;">Your email has been successfully verified, and your account is now active.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://projectoju.com/login" style="display: inline-block; font-size: 16px; font-weight: bold; color: #ffffff; background-color: #0056b3; padding: 14px 28px; border-radius: 6px; text-decoration: none;">
            Log In to Your Dashboard
          </a>
        </div>
        <p style="font-size: 14px; color: #666;">Stay healthy,<br/><strong>The Oju Team</strong></p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #999; text-align: center;">&copy; ${new Date().getFullYear()} Project Oju Vision Care.</p>
      </div>
    `;

    await sendEmail({
      to: user.email,
      subject: "Welcome to Project Oju! Account Verified",
      text: `Hello ${user.fullName || "User"}, your email is verified. Welcome to Project Oju.`,
      html: welcomeTemplate,
    });

    res
      .status(200)
      .json({ message: "Email verified successfully. Welcome email sent." });
  } catch (error) {
    console.error("OTP Verification Error:", error);
    res.status(500).json({ error: "Server error verifying OTP." });
  }
};

// -----------------------------------------
// @route   POST /api/v1/auth/login
// @desc    Login User / Doctor
// -----------------------------------------
exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res
        .status(400)
        .json({ error: "Email, password, and role are required." });
    }

    const UserModel = getModelByRole(role);
    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    if (!user.isVerified) {
      return res
        .status(403)
        .json({ error: "Please verify your email before logging in." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "your_super_secret_jwt_key",
      { expiresIn: "7d" },
    );

    // Clean up sensitive data before sending response
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.OTP;
    delete userResponse.otpExpired;

    res.status(200).json({
      message: "Login successful",
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Server error during login." });
  }
};
