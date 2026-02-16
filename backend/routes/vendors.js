const express = require("express");
const bcrypt = require("bcryptjs");
const Vendor = require("../models/Vendor");
const sendEmail = require("../utils/sendEmail");

const router = express.Router();

/* =========================================================
   REGISTER (VENDOR + DOCTOR) - DEFAULT STATUS = PENDING
========================================================= */
router.post("/register", async (req, res) => {
  try {
    const data = req.body;

    /* ================= VALIDATION ================= */

    if (!data.category) {
      return res.status(400).json({
        message: "Category is required"
      });
    }

    // Check duplicate email
    const existingVendor = await Vendor.findOne({ email: data.email });
    if (existingVendor) {
      return res.status(400).json({
        message: "Email already registered"
      });
    }

    /* ================= HASH PASSWORD ================= */

    const hashedPassword = await bcrypt.hash(data.password, 10);

    /* ================= CREATE RECORD ================= */

    const vendor = new Vendor({
      firstName: data.firstName,
      lastName: data.lastName,
      name: `${data.firstName} ${data.lastName}`,

      category: data.category, // Supports Doctor now
      speciality: data.speciality,

      mobile: data.mobile,
      email: data.email,
      password: hashedPassword,

      address: data.address,
      state: data.state,
      country: data.country,

      consultationFee: data.consultationFee,
      appointmentDuration: data.appointmentDuration,
      services: data.services,

      status: "PENDING",
      isActive: true
    });

    await vendor.save();

    /* ================= SEND EMAIL ================= */

/* ================= SEND EMAIL ================= */

try {
  await sendEmail({
    to: vendor.email,
    subject: `HealZone Registration Received – Pending Approval`,
    html: `
      <div style="font-family: Arial, Helvetica, sans-serif; background-color:#f4f6f8; padding:30px;">
        
        <div style="max-width:600px; margin:0 auto; background:#ffffff; padding:30px; border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,0.05);">
          
          <h2 style="color:#2563eb; margin-bottom:10px;">
            Welcome to HealZone, ${vendor.firstName}
          </h2>

          <p style="color:#333; font-size:14px; line-height:1.6;">
            Thank you for registering as a <strong>${vendor.category}</strong> on HealZone.
            We have successfully received your registration details.
          </p>

          <p style="color:#333; font-size:14px; line-height:1.6;">
            Your profile is currently under review by our team. 
            // Once verified and approved, you will be notified via email.
          </p>

          <div style="background:#f3f4f6; padding:15px 20px; border-radius:6px; margin:20px 0;">
            <p style="margin:6px 0; font-size:14px;"><strong>Status:</strong> Pending Approval</p>
            <p style="margin:6px 0; font-size:14px;"><strong>Category:</strong> ${vendor.category}</p>
            <p style="margin:6px 0; font-size:14px;"><strong>Registration Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>

          <p style="color:#333; font-size:14px; line-height:1.6;">
            If you have any questions or need assistance, feel free to contact our support team.
          </p>

          <hr style="margin:25px 0; border:none; border-top:1px solid #e5e7eb;" />

          <p style="font-size:13px; color:#777;">
            Regards,<br/>
            <strong>HealZone Team</strong><br/>
            <span style="color:#2563eb;">Connecting You to Better Care</span>
          </p>

        </div>

      </div>
    `
  });
} catch (emailError) {
  console.error("Registration email failed:", emailError.message);
}

    return res.status(201).json({
      message: `${vendor.category} registered successfully. Awaiting admin approval.`
    });

  } catch (err) {
    console.error("REGISTER ERROR:", err);

    return res.status(400).json({
      message: "Registration failed",
      error: err.message
    });
  }
});

/* =========================================================
   GET APPROVED VENDORS
========================================================= */
router.get("/approved", async (req, res) => {
  try {
    const vendors = await Vendor.find({
      status: "APPROVED",
      isActive: true
    }).select("-password");

    res.json(vendors);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch approved vendors"
    });
  }
});

/* =========================================================
   GET APPROVED DOCTORS ONLY
========================================================= */
router.get("/doctors", async (req, res) => {
  try {
    const doctors = await Vendor.find({
      category: "Doctor",
      status: "APPROVED",
      isActive: true
    }).select("-password");

    res.json(doctors);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch doctors"
    });
  }
});

/* =========================================================
   GET ALL VENDORS (ADMIN)
========================================================= */
router.get("/", async (req, res) => {
  try {
    const vendors = await Vendor.find().select("-password");
    res.json(vendors);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch vendors"
    });
  }
});

module.exports = router;