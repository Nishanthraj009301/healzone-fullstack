const express = require("express");
const bcrypt = require("bcryptjs");
const Vendor = require("../models/Vendor");
const sendEmail = require("../utils/sendEmail");

const router = express.Router();

/* =========================================================
   REGISTER (VENDOR + DOCTOR) - DEFAULT STATUS = PENDING
========================================================= */
router.post("/register", async (req, res) => {
  console.log("🚀 REGISTER ROUTE HIT");

  try {
    if (!req.body) {
      console.log("❌ No body received");
      return res.status(400).json({ message: "Request body missing" });
    }

    console.log("BODY:", req.body);

    const data = req.body;

    /* ================= VALIDATION ================= */

    if (!data.firstName || !data.lastName) {
      console.log("❌ Name validation failed");
      return res.status(400).json({
        message: "First name and last name are required",
      });
    }

    if (!data.email) {
      console.log("❌ Email missing");
      return res.status(400).json({
        message: "Email is required",
      });
    }

    if (!data.password) {
      console.log("❌ Password missing");
      return res.status(400).json({
        message: "Password is required",
      });
    }

    if (!data.category) {
      console.log("❌ Category missing");
      return res.status(400).json({
        message: "Category is required",
      });
    }

    console.log("✅ Validation passed");

    /* ================= CHECK DUPLICATE ================= */

    const existingVendor = await Vendor.findOne({ email: data.email });

    if (existingVendor) {
      console.log("❌ Duplicate email found");
      return res.status(400).json({
        message: "Email already registered",
      });
    }

    console.log("✅ No duplicate found");

    /* ================= HASH PASSWORD ================= */

    const hashedPassword = await bcrypt.hash(data.password, 10);
    console.log("✅ Password hashed");

    /* ================= CREATE RECORD ================= */

    const vendor = new Vendor({
      firstName: data.firstName,
      lastName: data.lastName,
      name: `${data.firstName} ${data.lastName}`,

      category: data.category,
      speciality: data.speciality || "",

      mobile: data.mobile || "",
      email: data.email,
      password: hashedPassword,

      address: data.address || "",
      state: data.state || "",
      country: data.country || "",

      consultationFee: data.consultationFee || 0,
      appointmentDuration: data.appointmentDuration || 30,
      services: data.services || [],

      status: "PENDING",
      isActive: true,
    });

    try {
      await vendor.save();
      console.log("✅ Vendor saved successfully");
    } catch (saveError) {
      console.error("❌ SAVE ERROR:", saveError);
      return res.status(500).json({
        message: "Database save failed",
        error: saveError.message,
      });
    }

/* ================= SEND EMAIL ================= */

try {
  console.log("📧 Sending email to:", vendor.email);

  await sendEmail({
    to: vendor.email,
    subject: "HealZone – Registration Received & Under Review",
    html: `
      <div style="font-family: Arial, Helvetica, sans-serif; background:#f4f6f9; padding:40px 20px;">
        
        <div style="max-width:600px; margin:0 auto; background:#ffffff; padding:30px; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.06);">
          
          <h2 style="color:#2563eb; margin-bottom:10px;">
            Welcome to HealZone, ${vendor.firstName} 👋
          </h2>

          <p style="color:#333; font-size:14px; line-height:1.6;">
            Thank you for registering as a <strong>${vendor.category}</strong> partner on <b>HealZone</b>.
          </p>

          <p style="color:#333; font-size:14px; line-height:1.6;">
            We have successfully received your registration details. 
            Your profile is currently being reviewed by our admin team to ensure quality and compliance.
          </p>

          <div style="background:#eef2ff; padding:15px 20px; border-radius:6px; margin:20px 0;">
            <p style="margin:6px 0; font-size:14px;">
              <strong>Registration Status:</strong> Pending Approval
            </p>
            <p style="margin:6px 0; font-size:14px;">
              <strong>Category:</strong> ${vendor.category}
            </p>
            <p style="margin:6px 0; font-size:14px;">
              <strong>Registered On:</strong> ${new Date().toDateString()}
            </p>
          </div>

          <p style="color:#333; font-size:14px; line-height:1.6;">
            Once your profile is approved, you will receive a confirmation email 
            with further instructions to start accepting appointments on HealZone.
          </p>

          <p style="color:#333; font-size:14px; line-height:1.6;">
            If you have any questions in the meantime, feel free to contact our support team.
          </p>

          <hr style="margin:30px 0; border:none; border-top:1px solid #e5e7eb;" />

          <p style="font-size:13px; color:#666; margin-bottom:4px;">
            Regards,
          </p>
          <p style="font-size:14px; font-weight:bold; color:#111;">
            HealZone Team
          </p>
          <p style="font-size:12px; color:#888;">
            Connecting You to Better Care
          </p>

        </div>
      </div>
    `,
  });

  console.log("✅ Registration email sent successfully");

} catch (emailError) {
  console.error("❌ Email sending failed:", emailError.message);
  // Do NOT fail registration because of email
}

    return res.status(201).json({
      message: "Registration successful. Awaiting admin approval.",
      vendorId: vendor._id,
    });

  } catch (err) {
    console.error("❌ REGISTER ERROR:", err);
    return res.status(500).json({
      message: "Registration failed",
      error: err.message,
    });
  }
});

module.exports = router;