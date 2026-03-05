const express = require("express");
const router = express.Router();

const {
  createBooking,
  getMyBookings,
  cancelBooking,
} = require("../controllers/bookingController");

const { protect } = require("../middleware/authMiddleware");

/* ================= CREATE BOOKING ================= */
// 🔒 Must be logged in
router.post("/create", protect, createBooking);

/* ================= GET MY BOOKINGS ================= */
// 🔒 Get logged-in user's bookings
router.get("/my", protect, getMyBookings);

/* ================= CANCEL BOOKING ================= */
// 🔒 Only owner can cancel
router.put("/cancel/:id", protect, cancelBooking);

module.exports = router;