const Booking = require("../models/Booking");
const Doctor = require("../models/Doctor");
const sendEmail = require("../utils/sendEmail");

/* =========================================================
   CREATE BOOKING (Protected Route Required)
========================================================= */
exports.createBooking = async (req, res) => {
  try {
    console.log("📥 BOOKING BODY:", req.body);

    const {
      vendorId,
      doctorId,
      bookingDate,
      bookingTime,
      phone,
      consultationFee,
    } = req.body;

    /* ================= BASIC VALIDATION ================= */

    if (!doctorId) {
      return res.status(400).json({
        message: "Doctor ID is required",
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

    /* ================= FETCH DOCTOR ================= */

    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor not found",
      });
    }

    /* ================= CREATE BOOKING ================= */

    const booking = await Booking.create({
      referenceNumber: "HZ-" + Date.now(),

      user: req.user._id, // 🔐 attach logged-in user

      vendorId: vendorId || null,
      doctorId,

      bookingDate: new Date(bookingDate),
      bookingTime,

      fullName: req.user.name,   // 🔥 from logged-in user
      email: req.user.email,     // 🔥 from logged-in user
      phone: phone || "",

      consultationFee: consultationFee || 0,
      status: "CONFIRMED",
    });

    console.log("✅ Booking saved successfully");

    /* ================= PREPARE EMAIL DATA ================= */

    const mapsLink =
      doctor.latitude && doctor.longitude
        ? `https://www.google.com/maps?q=${doctor.latitude},${doctor.longitude}`
        : null;

    const clinicAddress = `${doctor.address1 || ""}, ${doctor.city || ""}`;

    /* ================= SEND CONFIRMATION EMAIL ================= */

    try {
      console.log("📧 Sending booking email to:", booking.email);

      await sendEmail({
        to: booking.email,
        subject: "HealZone – Appointment Confirmed",
        html: `
          <div style="font-family: Arial, Helvetica, sans-serif; background:#f4f6f9; padding:40px 20px;">
            
            <div style="max-width:600px; margin:0 auto; background:#ffffff; padding:30px; border-radius:10px; box-shadow:0 6px 18px rgba(0,0,0,0.08);">

              <h2 style="color:#2563eb; margin-bottom:10px;">
                Appointment Confirmed 🎉
              </h2>

              <p style="font-size:14px; color:#333;">
                Hello <strong>${booking.fullName}</strong>,
              </p>

              <p style="font-size:14px; color:#333;">
                Your appointment has been successfully scheduled.
              </p>

              <hr style="margin:25px 0; border:none; border-top:1px solid #e5e7eb;" />

              <h3 style="margin-bottom:8px; color:#111;">Doctor Details</h3>

              <p><strong>Doctor:</strong> ${doctor.name}</p>
              <p><strong>Speciality:</strong> ${
                doctor.speciality || doctor.focus_area || "-"
              }</p>
              <p><strong>Clinic Address:</strong> ${clinicAddress}</p>

              ${
                mapsLink
                  ? `
                    <a href="${mapsLink}" target="_blank"
                      style="display:inline-block;padding:10px 18px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;font-size:14px;margin-bottom:20px;">
                      📍 View Location on Google Maps
                    </a>
                  `
                  : ""
              }

              <hr style="margin:25px 0; border:none; border-top:1px solid #e5e7eb;" />

              <h3 style="margin-bottom:8px; color:#111;">Appointment Details</h3>

              <p><strong>Date:</strong> ${booking.bookingDate.toDateString()}</p>
              <p><strong>Time:</strong> ${booking.bookingTime}</p>
              <p><strong>Reference Number:</strong> ${booking.referenceNumber}</p>
              <p><strong>Consultation Fee:</strong> ₹${booking.consultationFee}</p>

              <div style="background:#eef2ff; padding:15px; border-radius:6px; margin-top:20px;">
                <p style="margin:0; font-size:13px;">
                  Please arrive 10 minutes before your scheduled time.
                </p>
              </div>

              <hr style="margin:30px 0; border:none; border-top:1px solid #e5e7eb;" />

              <p style="font-size:14px;">
                Thank you for choosing <strong>HealZone</strong>.
              </p>

              <p style="font-size:13px; color:#777;">
                Regards,<br/>
                <strong>HealZone Team</strong>
              </p>

            </div>
          </div>
        `,
      });

      console.log("✅ Booking email sent successfully");

    } catch (emailError) {
      console.error("❌ Booking email failed:", emailError.message);
    }

    /* ================= SUCCESS RESPONSE ================= */

    return res.status(201).json({
      message: "Booking saved successfully",
      booking,
    });

  } catch (err) {
    console.error("❌ BOOKING ERROR:", err);

    return res.status(500).json({
      message: "Booking failed",
      error: err.message,
    });
  }
};

/* =========================================================
   GET MY BOOKINGS
========================================================= */
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      user: req.user._id,
    })
      .populate("doctorId")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    console.error("GET MY BOOKINGS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
};

/* =========================================================
   CANCEL BOOKING
========================================================= */
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    booking.status = "CANCELLED";
    await booking.save();

    res.json({ message: "Booking cancelled successfully" });

  } catch (err) {
    console.error("CANCEL BOOKING ERROR:", err);
    res.status(500).json({ message: "Failed to cancel booking" });
  }
};