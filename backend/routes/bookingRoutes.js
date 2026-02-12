const express = require("express");
const router = express.Router();

const {
  createBooking,
} = require("../controllers/bookingController");

// ================= CREATE BOOKING =================
router.post("/create", createBooking);

module.exports = router;
