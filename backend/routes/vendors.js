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
        subject: "HealZone Registration Received - Pending Approval",
        html: `
          <div style="font-family: Arial;">
            <h2>Welcome to HealZone, ${vendor.firstName}</h2>
            <p>Your registration as ${vendor.category} is under review.</p>
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