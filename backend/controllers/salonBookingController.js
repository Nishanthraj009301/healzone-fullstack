const SalonBooking = require("../models/SalonBooking");
const Salon = require("../models/Salon");
const sendEmail = require("../utils/sendEmail");

/* =========================================================
   CREATE SALON BOOKING (Protected Route Required)
========================================================= */
exports.createSalonBooking = async (req, res) => {
  try {
    const {
      salonId,
      serviceId,
      serviceName,
      servicePrice,
      bookingDate,
      bookingTime,
    } = req.body;

    /* ================= BASIC VALIDATION ================= */

    if (!salonId) {
      return res.status(400).json({
        message: "Salon ID is required",
      });
    }

    if (!serviceName) {
      return res.status(400).json({
        message: "Service is required",
      });
    }

    if (!bookingDate || !bookingTime) {
      return res.status(400).json({
        message: "Booking date and time are required",
      });
    }

    if (!req.user) {
      return res.status(401).json({
        message: "User not authenticated",
      });
    }

    /* ================= FETCH SALON ================= */

    const salon = await Salon.findById(salonId);

    if (!salon) {
      return res.status(404).json({
        message: "Salon not found",
      });
    }

    /* ================= PREVENT DOUBLE BOOKING ================= */

    const existingBooking = await SalonBooking.findOne({
      salonId,
      bookingDate: new Date(bookingDate),
      bookingTime,
      status: { $ne: "CANCELLED" },
    });

    if (existingBooking) {
      return res.status(400).json({
        message: "This slot is already booked",
      });
    }

    /* ================= CREATE BOOKING ================= */

    const booking = await SalonBooking.create({
      referenceNumber: "HZS-" + Date.now(),

      user: req.user._id,

      salonId,

      serviceId,

      salonName: salon.name,

      serviceName,

      servicePrice,

      bookingDate: new Date(bookingDate),

      bookingTime,

      customerName: req.user.name,

      customerEmail: req.user.email,

      status: "CONFIRMED",
    });

    /* ================= PREPARE EMAIL DATA ================= */

    const mapsLink =
      salon.latitude && salon.longitude
        ? `https://www.google.com/maps?q=${salon.latitude},${salon.longitude}`
        : null;

    const salonAddress = `${salon.address1 || ""}, ${salon.city || ""}`;

    /* ================= SEND CONFIRMATION EMAIL ================= */

    try {
      await sendEmail({
        to: booking.customerEmail,
        subject: "HealZone – Salon Booking Confirmed",
        html: `
          <div style="font-family: Arial; background:#f4f6f9; padding:40px 20px;">
            <div style="max-width:600px; margin:0 auto; background:#ffffff; padding:30px; border-radius:10px;">

              <h2 style="color:#2563eb;">
                Salon Booking Confirmed 💇
              </h2>

              <p>Hello <strong>${booking.customerName}</strong>,</p>

              <p>Your salon appointment has been successfully booked.</p>

              <hr>

              <h3>Salon Details</h3>

              <p><strong>Salon:</strong> ${booking.salonName}</p>

              <p><strong>Address:</strong> ${salonAddress}</p>

              ${
                mapsLink
                  ? `
                  <a href="${mapsLink}"
                     target="_blank"
                     style="
                        display:inline-block;
                        padding:10px 18px;
                        background:#2563eb;
                        color:white;
                        text-decoration:none;
                        border-radius:6px;
                        margin-top:10px;">
                     📍 View Location
                  </a>
                  `
                  : ""
              }

              <hr>

              <h3>Booking Details</h3>

              <p><strong>Service:</strong> ${booking.serviceName}</p>

              <p><strong>Price:</strong> ₹${booking.servicePrice}</p>

              <p><strong>Date:</strong> ${booking.bookingDate.toDateString()}</p>

              <p><strong>Time:</strong> ${booking.bookingTime}</p>

              <p><strong>Booking Reference:</strong> ${booking.referenceNumber}</p>

              <hr>

              <p>
                Thank you for choosing <strong>HealZone</strong>.
              </p>

            </div>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("Email failed:", emailError.message);
    }

    /* ================= SUCCESS RESPONSE ================= */

    return res.status(201).json({
      success: true,
      message: "Salon booking created successfully",
      booking,
    });

  } catch (err) {
    console.error("SALON BOOKING ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Booking failed",
      error: err.message,
    });
  }
};

/* =========================================================
   CANCEL SALON BOOKING
========================================================= */

exports.cancelSalonBooking = async (req, res) => {
  try {

    const booking = await SalonBooking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    booking.status = "CANCELLED";

    await booking.save();

    res.json({
      success: true,
      message: "Salon booking cancelled successfully",
    });

  } catch (err) {

    console.error("CANCEL SALON BOOKING ERROR:", err);

    res.status(500).json({
      success: false,
      message: "Failed to cancel booking",
    });

  }
};

/* =========================================================
   GET USER SALON BOOKINGS
========================================================= */

exports.getMySalonBookings = async (req, res) => {
  try {

    const bookings = await SalonBooking.find({
      user: req.user._id,
    })
      .populate("salonId", "name address1 city")
      .sort({ bookingDate: -1 });

    res.json(bookings);

  } catch (error) {

    console.error("Error fetching salon bookings:", error);

    res.status(500).json({
      message: "Server error",
    });

  }
};

/* =========================================================
   GET BOOKINGS FOR SALON OWNER DASHBOARD
========================================================= */

exports.getSalonBookings = async (req, res) => {
  try {

    const bookings = await SalonBooking.find({
      salonId: req.params.salonId,
    })
      .populate("user", "name email")
      .sort({ bookingDate: 1 });

    res.json({
      success: true,
      bookings,
    });

  } catch (error) {

    console.error("Salon bookings error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch salon bookings",
    });

  }
};