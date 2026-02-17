const Booking = require("../models/Booking");
const Doctor = require("../models/Doctor");
const sendEmail = require("../utils/sendEmail");

exports.createBooking = async (req, res) => {
  try {
    console.log("📥 BOOKING BODY:", req.body);

    const {
      vendorId,
      doctorId,
      bookingDate,
      bookingTime,
      fullName,
      email,
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

    if (!fullName || !email) {
      return res.status(400).json({
        message: "Name and email are required",
      });
    }

    /* ================= CREATE BOOKING ================= */

    const booking = await Booking.create({
      referenceNumber: "HZ-" + Date.now(),

      vendorId: vendorId || null,
      doctorId: doctorId || null,

      bookingDate: new Date(bookingDate),
      bookingTime: bookingTime || "",

      fullName: fullName || "",
      email: email || "",
      phone: phone || "",

      consultationFee: consultationFee || 0,
      status: "CONFIRMED",
    });

    console.log("✅ Booking saved successfully");

    /* ================= FETCH DOCTOR DETAILS ================= */

    let doctor = null;

    if (booking.doctorId) {
      doctor = await Doctor.findById(booking.doctorId);
    }

    const mapsLink =
      doctor?.latitude && doctor?.longitude
        ? `https://www.google.com/maps?q=${doctor.latitude},${doctor.longitude}`
        : null;

    const clinicAddress = doctor
      ? `${doctor.address1 || ""}, ${doctor.city || ""}`
      : "Not available";

    /* ================= SEND CONFIRMATION EMAIL ================= */

    try {
      console.log("📧 Sending booking email to:", booking.email);

      await sendEmail({
        to: booking.email,
        subject: "Healzone Appointment Confirmation",
        html: `
          <div style="font-family: Arial, sans-serif; padding:20px; line-height:1.6;">
            
            <h2 style="color:#3b82f6;">Appointment Confirmed 🎉</h2>
            
            <p>Hello <b>${booking.fullName}</b>,</p>
            <p>Your appointment has been successfully booked.</p>

            <hr/>

            <h3 style="margin-bottom:5px;">Doctor Details</h3>
            <p><b>Doctor:</b> ${doctor?.name || "Doctor not available"}</p>
            <p><b>Speciality:</b> ${
              doctor?.speciality || doctor?.focus_area || "-"
            }</p>
            <p><b>Clinic Address:</b> ${clinicAddress}</p>

            ${
              mapsLink
                ? `
                  <a href="${mapsLink}" target="_blank"
                    style="
                      display:inline-block;
                      padding:10px 16px;
                      background:#3b82f6;
                      color:white;
                      text-decoration:none;
                      border-radius:6px;
                      margin-top:8px;
                    ">
                    📍 Open in Google Maps
                  </a>
                `
                : ""
            }

            <hr/>

            <h3 style="margin-bottom:5px;">Appointment Details</h3>
            <p><b>Date:</b> ${booking.bookingDate.toDateString()}</p>
            <p><b>Time:</b> ${booking.bookingTime}</p>
            <p><b>Reference:</b> ${booking.referenceNumber}</p>
            <p><b>Consultation Fee:</b> ₹${booking.consultationFee}</p>

            <hr/>

            <p style="margin-top:15px;">
              Thank you for choosing <b>Healzone</b>.  
              We look forward to serving you.
            </p>
          </div>
        `,
      });

      console.log("✅ Booking email sent successfully");

    } catch (emailError) {
      console.error("❌ Booking email failed:", emailError.message);
      // IMPORTANT: Do NOT fail booking if email fails
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