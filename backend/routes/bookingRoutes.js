const express = require("express");
const router = express.Router();

const {
  createBooking,
} = require("../controllers/bookingController");

const { protect } = require("../middleware/authMiddleware");

// ================= CREATE BOOKING =================
router.post("/create", protect, createBooking);

module.exports = router;