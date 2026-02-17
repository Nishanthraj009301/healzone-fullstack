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
    console.log("🚀 REGISTER ROUTE HIT");
    console.log("BODY:", req.body);

    const data = req.body;

    /* ================= VALIDATION ================= */

    if (!data.firstName || !data.lastName) {
      return res.status(400).json({
        message: "First name and last name are required"
      });
    }

    if (!data.email) {
      return res.status(400).json({
        message: "Email is required"
      });
    }

    if (!data.password) {
      return res.status(400).json({
        message: "Password is required"
      });
    }

    if (!data.category) {
      return res.status(400).json({
        message: "Category is required"
      });
    }

    /* ================= CHECK DUPLICATE EMAIL ================= */

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
      isActive: true
    });

    await vendor.save();
    console.log("✅ Vendor saved successfully");

    /* ================= SEND EMAIL ================= */

    try {
      console.log("📧 Sending email to:", vendor.email);

      await sendEmail({
        to: vendor.email,
        subject: "HealZone Registration Received - Pending Approval",
        html: `
          <div style="font-family: Arial, Helvetica, sans-serif; background-color:#f4f6f8; padding:30px;">
            
            <div style="max-width:600px; margin:0 auto; background:#ffffff; padding:30px; border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,0.05);">
              
              <h2 style="color:#2563eb;">
                Welcome to HealZone, ${vendor.firstName}
              </h2>

              <p>
                Thank you for registering as a <strong>${vendor.category}</strong>.
              </p>

              <p>
                Your profile is currently under review by our admin team.
              </p>

              <div style="background:#f3f4f6; padding:15px; border-radius:6px; margin:20px 0;">
                <p><strong>Status:</strong> Pending Approval</p>
                <p><strong>Category:</strong> ${vendor.category}</p>
                <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
              </div>

              <p>
                We’ll notify you once your profile is approved.
              </p>

              <hr style="margin:25px 0;" />

              <p style="font-size:13px; color:#777;">
                Regards,<br/>
                <strong>HealZone Team</strong>
              </p>

            </div>
          </div>
        `
      });

      console.log("✅ Registration email sent successfully");
    } catch (emailError) {
      console.error("❌ Email sending failed:", emailError.message);
    }

    /* ================= SUCCESS RESPONSE ================= */

    return res.status(201).json({
      message: "Registration successful. Awaiting admin approval.",
      vendorId: vendor._id
    });

  } catch (err) {
    console.error("❌ REGISTER ERROR:", err);

    return res.status(500).json({
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

    return res.json(vendors);
  } catch (err) {
    console.error("Approved vendors error:", err);
    return res.status(500).json({
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

    return res.json(doctors);
  } catch (err) {
    console.error("Doctors fetch error:", err);
    return res.status(500).json({
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
    return res.json(vendors);
  } catch (err) {
    console.error("All vendors fetch error:", err);
    return res.status(500).json({
      message: "Failed to fetch vendors"
    });
  }
});

module.exports = router;