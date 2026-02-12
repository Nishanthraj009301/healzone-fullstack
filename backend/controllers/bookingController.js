const Booking = require("../models/Booking");
const Doctor = require("../models/Doctor");
const sendEmail = require("../utils/sendEmail");

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

    // ================= FETCH DOCTOR DETAILS =================
    let doctor = null;

    if (booking.doctorId) {
      doctor = await Doctor.findById(booking.doctorId);
    }

    // ================= PREPARE GOOGLE MAP LINK =================
    const mapsLink =
      doctor?.latitude && doctor?.longitude
        ? `https://www.google.com/maps?q=${doctor.latitude},${doctor.longitude}`
        : null;

    const clinicAddress = doctor
      ? `${doctor.address1 || ""}, ${doctor.city || ""}`
      : "Not available";

    // ================= SEND EMAIL =================
    try {
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

      console.log("📧 Email sent successfully");
    } catch (emailError) {
      console.error("❌ Email failed:", emailError.message);
    }

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
