const express = require("express");
const bcrypt = require("bcryptjs");
const Vendor = require("../models/Vendor");
const sendEmail = require("../utils/sendEmail");
const multer = require("multer");

const router = express.Router();

/* ================= MULTER CONFIG ================= */

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

/* =========================================================
   REGISTER
========================================================= */

router.post("/register", upload.single("photo"), async (req, res) => {
  try {
    const data = req.body;

    console.log("FULL BODY:", data);

    /* ================= VALIDATIONS ================= */

    if (!data.firstName || !data.lastName)
      return res.status(400).json({ message: "First name and last name required" });

    if (!data.email)
      return res.status(400).json({ message: "Email required" });

    if (!data.password)
      return res.status(400).json({ message: "Password required" });

    if (!data.category)
      return res.status(400).json({ message: "Category required" });

    const existingVendor = await Vendor.findOne({ email: data.email });

    if (existingVendor) {
      return res.status(400).json({
        message: "Email already registered"
      });
    }

    /* ================= HASH PASSWORD ================= */

    const hashedPassword = await bcrypt.hash(data.password, 10);

    /* ================= PARSE AVAILABILITY ================= */

    let parsedAvailability = [];

    if (data.availability) {
      try {
        parsedAvailability =
          typeof data.availability === "string"
            ? JSON.parse(data.availability)
            : data.availability;
      } catch (err) {
        console.log("❌ Availability parse error:", err);
        parsedAvailability = [];
      }
    }

    console.log("FINAL availability:", parsedAvailability);

    /* ================= LOCATION FIX ================= */

    let location = undefined;

    if (data.location) {
      try {
        const parsedLocation = JSON.parse(data.location);

        if (
          parsedLocation.coordinates &&
          parsedLocation.coordinates.length === 2
        ) {
          location = {
            type: "Point",
            coordinates: parsedLocation.coordinates
          };
        }
      } catch (err) {
        location = undefined;
      }
    }

    /* ================= CREATE VENDOR ================= */

    const vendor = new Vendor({
      firstName: data.firstName,
      lastName: data.lastName,
      name: `${data.firstName} ${data.lastName}`,

      photo: req.file ? req.file.filename : "",

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

      services: data.services || "",

      // ✅ FIXED HERE
      availability: parsedAvailability,

      location: location,

      status: "PENDING",
      isActive: true
    });

    await vendor.save();

    console.log("✅ SAVED VENDOR:", vendor);

    /* ================= SEND EMAIL ================= */

    try {
      await sendEmail({
        to: vendor.email,
        subject: "HealZone – Registration Received",
        html: `
          <h2>Welcome ${vendor.firstName}</h2>
          <p>Your account has been created.</p>
          <p>Status: <b>Pending Admin Approval</b></p>
        `
      });
    } catch (e) {
      console.log("Email failed but registration saved");
    }

    res.status(201).json({
      message: "Registration successful. Awaiting admin approval.",
      vendorId: vendor._id
    });

  } catch (err) {
    console.error("REGISTER ERROR:", err);

    res.status(500).json({
      message: "Registration failed"
    });
  }
});


/* =========================================================
   LOGIN
========================================================= */

router.post("/login", async (req, res) => {

  try {

    const { email, password } = req.body;

    const vendor = await Vendor.findOne({ email });

    if (!vendor) {
      return res.status(404).json({
        message: "Vendor not found"
      });
    }

    const match = await bcrypt.compare(password, vendor.password);

    if (!match) {
      return res.status(401).json({
        message: "Invalid password"
      });
    }

    res.json({
      success: true,
      role: "vendor",
      vendor
    });

  } catch (err) {

    console.error("LOGIN ERROR:", err);

    res.status(500).json({
      message: "Server error"
    });

  }

});


/* =========================================================
   GET VENDOR PROFILE
========================================================= */

router.get("/:id", async (req, res) => {

  try {

    const vendor = await Vendor.findById(req.params.id).select("-password");

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found"
      });
    }

    res.json({
      success: true,
      vendor
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }

});


/* =========================================================
   GET VENDOR SERVICES
========================================================= */

router.get("/:id/services", async (req, res) => {

  try {

    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({
        message: "Vendor not found"
      });
    }

    res.json({
      services: vendor.services || []
    });

  } catch (err) {

    res.status(500).json({
      message: "Server error"
    });

  }

});


/* =========================================================
   GET VENDOR APPOINTMENTS
========================================================= */

router.get("/:id/appointments", async (req, res) => {

  try {

    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({
        message: "Vendor not found"
      });
    }

    res.json({
      appointments: vendor.appointments || []
    });

  } catch (err) {

    res.status(500).json({
      message: "Server error"
    });

  }

});


/* =========================================================
   UPDATE VENDOR PROFILE
========================================================= */

router.put("/:id/update", upload.single("photo"), async (req, res) => {

  try {

    const updates = req.body;

    if (req.file) {
      updates.photo = req.file.filename;
    }

    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );

    res.json({
      success: true,
      vendor
    });

  } catch (err) {

    res.status(500).json({
      message: "Update failed"
    });

  }

});

  /* =========================================================
   UPDATE VENDOR AVAILABILITY
========================================================= */

router.put("/:id/availability", async (req, res) => {

  try {

    const { availability } = req.body;

    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      {
        availability: availability
      },
      { new: true }
    );

    if (!vendor) {

      return res.status(404).json({
        success: false,
        message: "Vendor not found"
      });

    }

    res.json({
      success: true,
      availability: vendor.availability
    });

  } catch (err) {

    console.error("Availability save error:", err);

    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }

});

module.exports = router;

