const express = require("express");
const bcrypt = require("bcryptjs");
const Vendor = require("../models/Vendor");
const sendEmail = require("../utils/sendEmail");

const router = express.Router();



/* =========================================================
   REGISTER VENDOR (DEFAULT STATUS = PENDING)
========================================================= */
router.post("/register", async (req, res) => {
  try {
    const data = req.body;

    // Prevent doctors from using vendor signup
    if (data.category === "Doctor") {
      return res.status(400).json({
        message: "Doctors must register via doctor signup"
      });
    }

    // Check duplicate email
    const existingVendor = await Vendor.findOne({ email: data.email });
    if (existingVendor) {
      return res.status(400).json({
        message: "Email already registered"
      });
    }

    // 🔥 HASH PASSWORD (NO next(), NO callbacks)
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const vendor = new Vendor({
      firstName: data.firstName,
      lastName: data.lastName,
      name: `${data.firstName} ${data.lastName}`,

      category: data.category,
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

      status: "PENDING",      // 🔥 ADMIN APPROVAL
      isActive: true
    });

    await vendor.save();

    // 📧 Send registration confirmation email
    await vendor.save();

    // 📧 Send registration confirmation email
    try {
      await sendEmail({
        to: vendor.email,
        subject: "HealZone Vendor Registration Successful 🎉",
        html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color:#2563eb;">Welcome to HealZone, ${vendor.firstName} 👋</h2>
        
        <p>Your vendor registration has been successfully received and has been sent for verification.</p>

        <div style="background:#f3f4f6; padding:15px; border-radius:8px;">
          <p><strong>Status:</strong> Awaiting approval</p>
          <p><strong>Category:</strong> ${vendor.category}</p>
          <p><strong>Registered On:</strong> ${new Date().toLocaleDateString()}</p>
        </div>

        <p>We will notify you once your profile is reviewed and approved.</p>

        <br/>
        <p>Regards,<br/><strong>HealZone Team</strong></p>
      </div>
    `
      });
    } catch (emailError) {
      console.error("Vendor email failed:", emailError.message);
    }

    return res.status(201).json({
      message: "Vendor registered successfully. Awaiting admin approval."
    });
  } catch (err) {
    console.error("VENDOR REGISTER ERROR:", err);

    return res.status(400).json({
      message: "Vendor registration failed",
      error: err.message
    });
  }
});

/* =========================================================
   GET APPROVED VENDORS (FOR FRONTEND SEARCH)
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
   GET ALL VENDORS (ADMIN / INTERNAL)
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
