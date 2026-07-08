const express = require("express");

const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
  createFitnessBooking,
  cancelFitnessBooking,
  getMyFitnessBookings,
  getFitnessBookings,
} = require("../controllers/fitnessBookingController");

// Create booking
router.post("/", protect, createFitnessBooking);

// Logged-in user's bookings
router.get("/my-bookings", protect, getMyFitnessBookings);

// Cancel booking
router.put("/cancel/:id", protect, cancelFitnessBooking);

// Fitness dashboard bookings
router.get("/fitness/:fitnessId", protect, getFitnessBookings);

module.exports = router;