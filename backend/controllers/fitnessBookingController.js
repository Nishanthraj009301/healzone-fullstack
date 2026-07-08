const FitnessBooking = require("../models/FitnessBooking");
const Fitness = require("../models/Fitness");
const sendEmail = require("../utils/sendEmail");

/* =========================================================
   CREATE FITNESS BOOKING (Protected Route Required)
========================================================= */
exports.createFitnessBooking = async (req, res) => {
  try {
    const {
      fitnessId,
      serviceId,
      serviceName,
      servicePrice,
      bookingDate,
      bookingTime,
    } = req.body;

    /* ================= BASIC VALIDATION ================= */

    if (!fitnessId) {
      return res.status(400).json({
        message: "Fitness ID is required",
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

    /* ================= FETCH FITNESS CENTER ================= */

    const fitness = await Fitness.findById(fitnessId);

    if (!fitness) {
      return res.status(404).json({
        message: "Fitness center not found",
      });
    }

    /* ================= PREVENT DOUBLE BOOKING ================= */

    const existingBooking = await FitnessBooking.findOne({
      fitnessId,
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

    const booking = await FitnessBooking.create({
      referenceNumber: "HZF-" + Date.now(),

      user: req.user._id,

      fitnessId,

      serviceId,

      fitnessName: fitness.VenueName,

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
      fitness.AddressJson?.latitude &&
      fitness.AddressJson?.longitude
        ? `https://www.google.com/maps?q=${fitness.AddressJson.latitude},${fitness.AddressJson.longitude}`
        : null;

    const fitnessAddress =
      fitness.AddressJson?.simpleFormatted || "Address not available";

    /* ================= SEND CONFIRMATION EMAIL ================= */

    try {
      console.log("========== BEFORE EMAIL ==========");

      await sendEmail({
        to: booking.customerEmail,
        subject: "HealZone – Fitness Booking Confirmed",
        html: `
<div style="font-family:Arial,Helvetica,sans-serif;background:#f4f6f9;padding:40px 20px;">
  <div style="max-width:650px;margin:auto;background:#ffffff;border-radius:10px;padding:30px;box-shadow:0 2px 8px rgba(0,0,0,.1);">

    <div style="text-align:center;">
      <h1 style="color:#2563eb;margin-bottom:5px;">
        HealZone
      </h1>

      <h2 style="color:#16a34a;margin-top:0;">
        💪 Fitness Booking Confirmed
      </h2>
    </div>

    <p>Hello <strong>${booking.customerName}</strong>,</p>

    <p>
      Thank you for booking with <strong>HealZone</strong>.
      Your fitness appointment has been successfully confirmed.
    </p>

    <hr style="margin:25px 0;">

    <h3 style="color:#2563eb;">🏋️ Fitness Center Details</h3>

    <table style="width:100%;border-collapse:collapse;">

      <tr>
        <td style="padding:8px;"><strong>Fitness Center</strong></td>
        <td>${booking.fitnessName}</td>
      </tr>

      <tr>
        <td style="padding:8px;"><strong>Address</strong></td>
        <td>${fitnessAddress}</td>
      </tr>

    </table>

    ${
      mapsLink
        ? `
        <div style="margin-top:15px;">
          <a href="${mapsLink}"
             target="_blank"
             style="
               background:#2563eb;
               color:white;
               padding:10px 18px;
               border-radius:6px;
               text-decoration:none;
               display:inline-block;">
             📍 View on Google Maps
          </a>
        </div>
        `
        : ""
    }

    <hr style="margin:25px 0;">

    <h3 style="color:#2563eb;">📅 Booking Details</h3>

    <table style="width:100%;border-collapse:collapse;">

      <tr>
        <td style="padding:8px;"><strong>Service</strong></td>
        <td>${booking.serviceName}</td>
      </tr>

      <tr>
        <td style="padding:8px;"><strong>Price</strong></td>
        <td>₹${booking.servicePrice}</td>
      </tr>

      <tr>
        <td style="padding:8px;"><strong>Date</strong></td>
        <td>${booking.bookingDate.toDateString()}</td>
      </tr>

      <tr>
        <td style="padding:8px;"><strong>Time</strong></td>
        <td>${booking.bookingTime}</td>
      </tr>

      <tr>
        <td style="padding:8px;"><strong>Booking Reference</strong></td>
        <td>${booking.referenceNumber}</td>
      </tr>

      <tr>
        <td style="padding:8px;"><strong>Status</strong></td>
        <td style="color:green;font-weight:bold;">
          ${booking.status}
        </td>
      </tr>

    </table>

    <hr style="margin:25px 0;">

    <p>
      Please arrive <strong>10–15 minutes before</strong> your scheduled appointment.
    </p>

    <p>
      If you need to cancel or reschedule your appointment, you can do so from your HealZone account.
    </p>

    <br>

    <p>
      Thank you for choosing <strong>HealZone</strong>.
    </p>

    <p style="color:#777;font-size:13px;">
      This is an automated email. Please do not reply.
    </p>

  </div>
</div>
`,
      });

      console.log("========== AFTER EMAIL ==========");
    } catch (emailError) {
      console.error("Email failed:", emailError.message);
    }

    /* ================= SUCCESS RESPONSE ================= */

    return res.status(201).json({
      success: true,
      message: "Fitness booking created successfully",
      booking,
    });

  } catch (err) {
    console.error("FITNESS BOOKING ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Booking failed",
      error: err.message,
    });
  }
};

/* =========================================================
   CANCEL FITNESS BOOKING
========================================================= */

exports.cancelFitnessBooking = async (req, res) => {
  try {
    const booking = await FitnessBooking.findById(req.params.id);

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
      message: "Fitness booking cancelled successfully",
    });

  } catch (err) {
    console.error("CANCEL FITNESS BOOKING ERROR:", err);

    res.status(500).json({
      success: false,
      message: "Failed to cancel booking",
    });
  }
};

/* =========================================================
   GET USER FITNESS BOOKINGS
========================================================= */

exports.getMyFitnessBookings = async (req, res) => {
  try {
    const bookings = await FitnessBooking.find({
      user: req.user._id,
    })
      .populate("fitnessId", "VenueName AddressJson")
      .sort({ bookingDate: -1 });

    res.json(bookings);

  } catch (error) {
    console.error("Error fetching fitness bookings:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

/* =========================================================
   GET BOOKINGS FOR FITNESS OWNER DASHBOARD
========================================================= */

exports.getFitnessBookings = async (req, res) => {
  try {
    const bookings = await FitnessBooking.find({
      fitnessId: req.params.fitnessId,
    })
      .populate("user", "name email")
      .sort({ bookingDate: 1 });

    res.json({
      success: true,
      bookings,
    });

  } catch (error) {
    console.error("Fitness bookings error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch fitness bookings",
    });
  }
};