const Booking = require("../models/Booking");

exports.createBooking = async (req, res) => {
  try {
    console.log("BOOKING BODY:", req.body);

    const booking = await Booking.create({
      referenceNumber: "HZ-" + Date.now(),

      vendorId: req.body.vendorId || null,
      doctorId: req.body.doctorId || null,

      bookingDate: req.body.bookingDate
        ? new Date(req.body.bookingDate)
        : new Date(),

      bookingTime: req.body.bookingTime || "",

      fullName: req.body.fullName || "",
      email: req.body.email || "",
      phone: req.body.phone || "",

      consultationFee: req.body.consultationFee || 0,
      status: req.body.status || "CONFIRMED",
    });

    return res.status(201).json({
      message: "Booking saved successfully",
      booking,
    });
  } catch (err) {
    console.error("BOOKING ERROR:", err);

    return res.status(500).json({
      message: "Booking failed",
      error: err.message,
    });
  }
};
