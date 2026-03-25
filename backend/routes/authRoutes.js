const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

/* ================= AUTH ================= */

// Patient registration
router.post("/register", authController.register);

// 🔥 Vendor registration (NEW)
router.post("/register-vendor", authController.registerVendor);

// Login
router.post("/login", authController.login);

// Google login for patients
router.post("/google/patient", authController.googlePatientLogin);

// Google login for vendors
router.post("/google-vendor", authController.googleVendorLogin);

// Forgot password
router.post("/forgot-password", authController.forgotPassword);

// Reset password
router.post("/reset-password/:token", authController.resetPassword);

// Update profile
router.put("/update-profile", protect, authController.updateProfile);

/* ================= SESSION ================= */

// Get logged in user
router.get("/me", protect, authController.getMe);

// Logout
router.post("/logout", authController.logout);

module.exports = router;
