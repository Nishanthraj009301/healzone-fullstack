const express = require("express");
const bcrypt = require("bcryptjs");
const Vendor = require("../models/Vendor");

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
