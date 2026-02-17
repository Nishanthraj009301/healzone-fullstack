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
    subject: "HealZone – Appointment Confirmed",
    html: `
      <div style="font-family: Arial, Helvetica, sans-serif; background:#f4f6f9; padding:40px 20px;">
        
        <div style="max-width:600px; margin:0 auto; background:#ffffff; padding:30px; border-radius:10px; box-shadow:0 6px 18px rgba(0,0,0,0.08);">

          <h2 style="color:#2563eb; margin-bottom:10px;">
            Appointment Confirmed 🎉
          </h2>

          <p style="font-size:14px; color:#333; line-height:1.6;">
            Hello <strong>${booking.fullName}</strong>,
          </p>

          <p style="font-size:14px; color:#333; line-height:1.6;">
            Your appointment has been successfully scheduled. 
            Please find the details below:
          </p>

          <hr style="margin:25px 0; border:none; border-top:1px solid #e5e7eb;" />

          <!-- Doctor Section -->
          <h3 style="margin-bottom:8px; color:#111;">Doctor Details</h3>

          <p style="margin:4px 0; font-size:14px;">
            <strong>Doctor:</strong> ${doctor?.name || "Not Available"}
          </p>

          <p style="margin:4px 0; font-size:14px;">
            <strong>Speciality:</strong> ${
              doctor?.speciality || doctor?.focus_area || "-"
            }
          </p>

          <p style="margin:4px 0 12px 0; font-size:14px;">
            <strong>Clinic Address:</strong> ${clinicAddress}
          </p>

          ${
            mapsLink
              ? `
                <a href="${mapsLink}" target="_blank"
                  style="
                    display:inline-block;
                    padding:10px 18px;
                    background:#2563eb;
                    color:#ffffff;
                    text-decoration:none;
                    border-radius:6px;
                    font-size:14px;
                    margin-bottom:20px;
                  ">
                  📍 View Location on Google Maps
                </a>
              `
              : ""
          }

          <hr style="margin:25px 0; border:none; border-top:1px solid #e5e7eb;" />

          <!-- Appointment Section -->
          <h3 style="margin-bottom:8px; color:#111;">Appointment Details</h3>

          <p style="margin:4px 0; font-size:14px;">
            <strong>Date:</strong> ${booking.bookingDate.toDateString()}
          </p>

          <p style="margin:4px 0; font-size:14px;">
            <strong>Time:</strong> ${booking.bookingTime}
          </p>

          <p style="margin:4px 0; font-size:14px;">
            <strong>Reference Number:</strong> ${booking.referenceNumber}
          </p>

          <p style="margin:4px 0; font-size:14px;">
            <strong>Consultation Fee:</strong> ₹${booking.consultationFee}
          </p>

          <div style="background:#eef2ff; padding:15px; border-radius:6px; margin-top:20px;">
            <p style="margin:0; font-size:13px; color:#333;">
              Please arrive 10 minutes before your scheduled time. 
              Carry any relevant medical records if applicable.
            </p>
          </div>

          <hr style="margin:30px 0; border:none; border-top:1px solid #e5e7eb;" />

          <p style="font-size:14px; color:#333;">
            Thank you for choosing <strong>HealZone</strong>.  
            We are committed to providing you with quality healthcare services.
          </p>

          <p style="font-size:13px; color:#777; margin-top:20px;">
            Regards,<br/>
            <strong>HealZone Team</strong><br/>
            Connecting You to Better Care
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