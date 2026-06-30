const express = require("express");

const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
  createSpaBooking,
  cancelSpaBooking,
  getMySpaBookings,
  getSpaBookings,
} = require("../controllers/spaBookingController");

// Create booking
router.post("/", protect, createSpaBooking);

// Logged-in user's bookings
router.get("/my-bookings", protect, getMySpaBookings);

// Cancel booking
router.put("/cancel/:id", protect, cancelSpaBooking);

// Spa dashboard bookings
router.get("/spa/:spaId", protect, getSpaBookings);

module.exports = router;