const express = require("express");
const router = express.Router();
const authController = require("../controller/auth.controller");

/**
 * @swagger
 * /api/v1/auth/register:
 * post:
 * summary: Register a new patient or doctor
 * tags: [Auth]
 * security: []
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - email
 * - password
 * - fullName
 * - phone
 * - address
 * properties:
 * email:
 * type: string
 * password:
 * type: string
 * fullName:
 * type: string
 * phone:
 * type: string
 * address:
 * type: string
 * role:
 * type: string
 * enum: [user, doctor]
 * responses:
 * 201:
 * description: Registration successful
 */
router.post("/register", authController.register);

/**
 * @swagger
 * /api/v1/auth/verify-otp:
 * post:
 * summary: Verify email using OTP
 * tags: [Auth]
 * security: []
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - email
 * - otp
 * - role
 * properties:
 * email:
 * type: string
 * otp:
 * type: string
 * role:
 * type: string
 * enum: [user, doctor]
 * responses:
 * 200:
 * description: Email verified successfully
 */
router.post("/verify-otp", authController.verifyOTP);

/**
 * @swagger
 * /api/v1/auth/login:
 * post:
 * summary: Login for all users
 * tags: [Auth]
 * security: []
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - email
 * - password
 * - role
 * properties:
 * email:
 * type: string
 * password:
 * type: string
 * role:
 * type: string
 * enum: [user, doctor, admin]
 * responses:
 * 200:
 * description: Login successful
 */
router.post("/login", authController.login);

module.exports = router;
