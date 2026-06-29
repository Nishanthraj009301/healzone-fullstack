const express = require("express");

const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
  createSalonBooking,
  cancelSalonBooking,
  getMySalonBookings,
  getSalonBookings,
} = require("../controllers/salonBookingController");

// Create booking
router.post("/", protect, createSalonBooking);

// Logged-in user's bookings
router.get("/my-bookings", protect, getMySalonBookings);

// Cancel booking
router.put("/cancel/:id", protect, cancelSalonBooking);

// Salon dashboard bookings
router.get("/salon/:salonId", protect, getSalonBookings);

module.exports = router;