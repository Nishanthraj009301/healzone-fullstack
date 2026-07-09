const MentalHealthBooking = require("../models/MentalHealthBooking");
const MentalHealth = require("../models/MentalHealth");
const sendEmail = require("../utils/sendEmail");

/* =========================================================
   CREATE MENTAL HEALTH BOOKING (Protected Route Required)
========================================================= */
exports.createMentalHealthBooking = async (req, res) => {
    try {
        const {
            mentalHealthId,
            serviceId,
            serviceName,
            servicePrice,
            bookingDate,
            bookingTime,
        } = req.body;

        /* ================= BASIC VALIDATION ================= */

        if (!mentalHealthId) {
            return res.status(400).json({
                message: "Mental Health Center ID is required",
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

        /* ================= FETCH MENTAL HEALTH CENTER ================= */

        const mentalHealth = await MentalHealth.findById(mentalHealthId);

        if (!mentalHealth) {
            return res.status(404).json({
                message: "Mental Health Center not found",
            });
        }

        /* ================= PREVENT DOUBLE BOOKING ================= */

        const existingBooking = await MentalHealthBooking.findOne({
            mentalHealthId,
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

        const booking = await MentalHealthBooking.create({
            referenceNumber: "HZM-" + Date.now(),

            user: req.user._id,

            mentalHealthId,

            serviceId,

            mentalHealthName: mentalHealth.VenueName,

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
            mentalHealth.AddressJson?.latitude &&
                mentalHealth.AddressJson?.longitude
                ? `https://www.google.com/maps?q=${mentalHealth.AddressJson.latitude},${mentalHealth.AddressJson.longitude}`
                : null;

        const mentalHealthAddress =
            mentalHealth.AddressJson?.simpleFormatted || "Address not available";

        await sendEmail({
            to: booking.customerEmail,
            subject: "HealZone – Mental Health Booking Confirmed",
            html: `
<div style="font-family:Arial,Helvetica,sans-serif;background:#f4f6f9;padding:40px 20px;">
  <div style="max-width:650px;margin:auto;background:#ffffff;border-radius:10px;padding:30px;box-shadow:0 2px 8px rgba(0,0,0,.1);">

    <div style="text-align:center;">
      <h1 style="color:#2563eb;margin-bottom:5px;">
        HealZone
      </h1>

      <h2 style="color:#16a34a;margin-top:0;">
        🧠 Mental Health Booking Confirmed
      </h2>
    </div>

    <p>Hello <strong>${booking.customerName}</strong>,</p>

    <p>
      Thank you for booking with <strong>HealZone</strong>.
      Your mental health consultation has been successfully confirmed.
    </p>

    <hr style="margin:25px 0;">

    <h3 style="color:#2563eb;">🧠 Mental Health Center Details</h3>

    <table style="width:100%;border-collapse:collapse;">

      <tr>
        <td style="padding:8px;"><strong>Center</strong></td>
        <td>${booking.mentalHealthName}</td>
      </tr>

      <tr>
        <td style="padding:8px;"><strong>Address</strong></td>
        <td>${mentalHealthAddress}</td>
      </tr>

    </table>

    ${mapsLink
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

    <h3 style="color:#2563eb;">📅 Appointment Details</h3>

    <table style="width:100%;border-collapse:collapse;">

      <tr>
        <td style="padding:8px;"><strong>Service</strong></td>
        <td>${booking.serviceName}</td>
      </tr>

      <tr>
        <td style="padding:8px;"><strong>Fee</strong></td>
        <td>${booking.servicePrice}</td>
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
        <td style="padding:8px;"><strong>Reference</strong></td>
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
      Please arrive <strong>10–15 minutes early</strong> for your appointment.
    </p>

    <p>
      If you need to cancel or reschedule, you can manage your booking through your HealZone account.
    </p>

    <br>

    <p>
      Thank you for choosing <strong>HealZone</strong>. We wish you the very best on your wellness journey.
    </p>

    <p style="color:#777;font-size:13px;">
      This is an automated email. Please do not reply.
    </p>

  </div>
</div>
`,
        });

        console.log("========== AFTER EMAIL ==========");

        /* ================= SUCCESS RESPONSE ================= */

        return res.status(201).json({
            success: true,
            message: "Mental Health booking created successfully",
            booking,
        });

    } catch (err) {
        console.error("MENTAL HEALTH BOOKING ERROR:", err);

        return res.status(500).json({
            success: false,
            message: "Booking failed",
            error: err.message,
        });
    }
};

/* =========================================================
   CANCEL MENTAL HEALTH BOOKING
========================================================= */

exports.cancelMentalHealthBooking = async (req, res) => {
    try {
        const booking = await MentalHealthBooking.findById(req.params.id);

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
            message: "Mental Health booking cancelled successfully",
        });

    } catch (err) {
        console.error("CANCEL MENTAL HEALTH BOOKING ERROR:", err);

        res.status(500).json({
            success: false,
            message: "Failed to cancel booking",
        });
    }
};

/* =========================================================
   GET USER MENTAL HEALTH BOOKINGS
========================================================= */

exports.getMyMentalHealthBookings = async (req, res) => {
    try {
        const bookings = await MentalHealthBooking.find({
            user: req.user._id,
        })
            .populate("mentalHealthId", "VenueName AddressJson")
            .sort({ bookingDate: -1 });

        res.json(bookings);

    } catch (error) {
        console.error("Error fetching mental health bookings:", error);

        res.status(500).json({
            message: "Server error",
        });
    }
};

/* =========================================================
   GET BOOKINGS FOR MENTAL HEALTH OWNER DASHBOARD
========================================================= */

exports.getMentalHealthBookings = async (req, res) => {
    try {
        const bookings = await MentalHealthBooking.find({
            mentalHealthId: req.params.mentalHealthId,
        })
            .populate("user", "name email")
            .sort({ bookingDate: 1 });

        res.json({
            success: true,
            bookings,
        });

    } catch (error) {
        console.error("Mental Health bookings error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch mental health bookings",
        });
    }
};