const express = require("express");
const router = express.Router();

const {
  createMentalHealthBooking,
  cancelMentalHealthBooking,
  getMyMentalHealthBookings,
  getMentalHealthBookings,
} = require("../controllers/mentalHealthBookingController");

const { protect } = require("../middleware/authMiddleware");

/* =========================================================
   CREATE BOOKING
========================================================= */
router.post("/", protect, createMentalHealthBooking);

/* =========================================================
   GET LOGGED-IN USER BOOKINGS
========================================================= */
router.get("/my", protect, getMyMentalHealthBookings);

/* =========================================================
   CANCEL BOOKING
========================================================= */
router.delete("/:id", protect, cancelMentalHealthBooking);

/* =========================================================
   GET BOOKINGS FOR A MENTAL HEALTH CENTER
========================================================= */
router.get("/:mentalHealthId", protect, getMentalHealthBookings);

module.exports = router;