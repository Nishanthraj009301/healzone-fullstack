const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

/* ================= AUTH ================= */

router.post("/register", authController.register);

router.post("/login", authController.login);

router.post("/google/patient", authController.googlePatientLogin);

router.post("/forgot-password", authController.forgotPassword);

router.post("/reset-password/:token", authController.resetPassword);

router.put("/update-profile", protect, authController.updateProfile);

/* ================= SESSION ================= */

router.get("/me", protect, authController.getMe);

router.post("/logout", authController.logout);

module.exports = router;