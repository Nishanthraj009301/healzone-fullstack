const Booking = require("../models/Booking");
const Doctor = require("../models/Doctor");
const sendEmail = require("../utils/sendEmail");
const Vendor = require("../models/Vendor");

/* =========================================================
   CREATE BOOKING (Protected Route Required)
========================================================= */
exports.createBooking = async (req, res) => {
  try {
    const {
      vendorId,
      doctorId,
      bookingDate,
      bookingTime,
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

    let doctor = await Doctor.findById(doctorId);

if (!doctor) {
  doctor = await Vendor.findById(doctorId);
}

if (!doctor) {
  return res.status(404).json({ message: "Doctor not found" });
}

    /* ================= PREVENT DOUBLE BOOKING ================= */

    const existingBooking = await Booking.findOne({
      doctorId,
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

    const booking = await Booking.create({
      referenceNumber: "HZ-" + Date.now(),

      // 🔐 attach logged-in user
      user: req.user._id,

      vendorId: doctor.vendorId || doctor._id,
doctorId,

      bookingDate: new Date(bookingDate),
      bookingTime,

      // 🔥 always from authenticated user
      fullName: req.user.name,
      email: req.user.email,

      consultationFee: consultationFee || 0,
      status: "CONFIRMED",
    });

    /* ================= PREPARE EMAIL DATA ================= */

    const mapsLink =
      doctor.latitude && doctor.longitude
        ? `https://www.google.com/maps?q=${doctor.latitude},${doctor.longitude}`
        : null;

    const clinicAddress = `${doctor.address1 || ""}, ${doctor.city || ""}`;

    /* ================= SEND CONFIRMATION EMAIL ================= */

    try {
      await sendEmail({
        to: booking.email,
        subject: "HealZone – Appointment Confirmed",
        html: `
          <div style="font-family: Arial; background:#f4f6f9; padding:40px 20px;">
            <div style="max-width:600px; margin:0 auto; background:#ffffff; padding:30px; border-radius:10px;">
              <h2 style="color:#2563eb;">Appointment Confirmed 🎉</h2>
              <p>Hello <strong>${booking.fullName}</strong>,</p>
              <p>Your appointment has been successfully scheduled.</p>

              <hr/>

              <h3>Doctor Details</h3>
              <p><strong>Doctor:</strong> ${doctor.name}</p>
              <p><strong>Speciality:</strong> ${
                doctor.speciality || doctor.focus_area || "-"
              }</p>
              <p><strong>Clinic Address:</strong> ${clinicAddress}</p>

              ${
                mapsLink
                  ? `<a href="${mapsLink}" target="_blank"
                      style="display:inline-block;padding:8px 16px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;margin-top:10px;">
                      📍 View Location
                     </a>`
                  : ""
              }

              <hr/>

              <h3>Appointment Details</h3>
              <p><strong>Date:</strong> ${booking.bookingDate.toDateString()}</p>
              <p><strong>Time:</strong> ${booking.bookingTime}</p>
              <p><strong>Reference:</strong> ${booking.referenceNumber}</p>
              <p><strong>Consultation Fee:</strong> ₹${booking.consultationFee}</p>

              <p style="margin-top:20px;">Thank you for choosing HealZone.</p>
            </div>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("Email failed:", emailError.message);
    }

    /* ================= SUCCESS RESPONSE ================= */

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

// ================ bookings in user dashboard==================
exports.getMyBookings = async (req, res) => {
  try {

    const bookings = await Booking.find({
      user: req.user.id
    }).populate("doctorId", "name speciality");

    res.json(bookings);

  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================================================
   GET BOOKINGS FOR VENDOR DASHBOARD
========================================================= */
exports.getVendorBookings = async (req, res) => {
  try {

    const bookings = await Booking.find({
      vendorId: req.user._id
    })
    .populate("user", "name email")
    .populate("doctorId", "name speciality")
    .sort({ bookingDate: 1 });

    res.json({
      success: true,
      appointments: bookings
    });

  } catch (error) {

    console.error("Vendor bookings error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch bookings"
    });

  }
};