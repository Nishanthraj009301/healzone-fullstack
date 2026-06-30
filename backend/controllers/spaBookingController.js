const SpaBooking = require("../models/SpaBooking");
const Spa = require("../models/Spa");
const sendEmail = require("../utils/sendEmail");

/* =========================================================
   CREATE SPA BOOKING (Protected Route Required)
========================================================= */
exports.createSpaBooking = async (req, res) => {
  try {
    const {
      spaId,
      serviceId,
      serviceName,
      servicePrice,
      bookingDate,
      bookingTime,
    } = req.body;

    /* ================= BASIC VALIDATION ================= */

    if (!spaId) {
      return res.status(400).json({
        message: "Spa ID is required",
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

    /* ================= FETCH SPA ================= */

    const spa = await Spa.findById(spaId);

    if (!spa) {
      return res.status(404).json({
        message: "Spa not found",
      });
    }

    /* ================= PREVENT DOUBLE BOOKING ================= */

    const existingBooking = await SpaBooking.findOne({
      spaId,
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

    const booking = await SpaBooking.create({
      referenceNumber: "HZS-" + Date.now(),

      user: req.user._id,

      spaId,

      serviceId,

      spaName: spa.SalonName,

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
  spa.AddressJson?.latitude &&
  spa.AddressJson?.longitude
    ? `https://www.google.com/maps?q=${spa.AddressJson.latitude},${spa.AddressJson.longitude}`
    : null;

    const spaAddress =
  spa.AddressJson?.simpleFormatted || "Address not available";

    /* ================= SEND CONFIRMATION EMAIL ================= */

    try {
      console.log("========== BEFORE EMAIL ==========");
      await sendEmail({
        to: booking.customerEmail,
        subject: "HealZone – Spa Booking Confirmed",
        html: `
<div style="font-family:Arial,Helvetica,sans-serif;background:#f4f6f9;padding:40px 20px;">
  <div style="max-width:650px;margin:auto;background:#ffffff;border-radius:10px;padding:30px;box-shadow:0 2px 8px rgba(0,0,0,.1);">

    <div style="text-align:center;">
      <h1 style="color:#2563eb;margin-bottom:5px;">
        HealZone
      </h1>

      <h2 style="color:#16a34a;margin-top:0;">
        ✅ Spa Booking Confirmed
      </h2>
    </div>

    <p>Hello <strong>${booking.customerName}</strong>,</p>

    <p>
      Thank you for booking with <strong>HealZone</strong>.
      Your spa appointment has been successfully confirmed.
    </p>

    <hr style="margin:25px 0;">

    <h3 style="color:#2563eb;">💇 Spa Details</h3>

    <table style="width:100%;border-collapse:collapse;">

      <tr>
        <td style="padding:8px;"><strong>Spa</strong></td>
        <td>${booking.spaName}</td>
      </tr>

      <tr>
        <td style="padding:8px;"><strong>Address</strong></td>
        <td>${spaAddress}</td>
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
      message: "Spa booking created successfully",
      booking,
    });

  } catch (err) {
    console.error("SPA BOOKING ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Booking failed",
      error: err.message,
    });
  }
};

/* =========================================================
   CANCEL spa BOOKING
========================================================= */

exports.cancelSpaBooking = async (req, res) => {
  try {

    const booking = await SpaBooking.findById(req.params.id);

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
      message: "Spa booking cancelled successfully",
    });

  } catch (err) {

    console.error("CANCEL SPA BOOKING ERROR:", err);

    res.status(500).json({
      success: false,
      message: "Failed to cancel booking",
    });

  }
};

/* =========================================================
   GET USER spa BOOKINGS
========================================================= */

exports.getMySpaBookings = async (req, res) => {
  try {

    const bookings = await SpaBooking.find({
      user: req.user._id,
    })
      .populate("spaId", "SalonName AddressJson")
      .sort({ bookingDate: -1 });

    res.json(bookings);

  } catch (error) {

    console.error("Error fetching spa bookings:", error);

    res.status(500).json({
      message: "Server error",
    });

  }
};

/* =========================================================
   GET BOOKINGS FOR spa OWNER DASHBOARD
========================================================= */

exports.getSpaBookings = async (req, res) => {
  try {

    const bookings = await SpaBooking.find({
      spaId: req.params.spaId,
    })
      .populate("user", "name email")
      .sort({ bookingDate: 1 });

    res.json({
      success: true,
      bookings,
    });

  } catch (error) {

    console.error("spa bookings error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch spa bookings",
    });

  }
};