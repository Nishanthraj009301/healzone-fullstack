const express = require("express");
const router = express.Router();

const Vendor = require("../models/Vendor");
const Doctor = require("../models/Doctor");

/* ================= ADMIN LOGIN ================= */
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (username === "admin" && password === "admin123") {
    return res.json({ success: true });
  }

  return res.status(401).json({ message: "Invalid admin credentials" });
});

/* =========================================================
   GET PENDING VENDORS
========================================================= */
router.get("/vendors", async (req, res) => {
  try {
    const pendingVendors = await Vendor.find({
      status: "PENDING",
      isActive: true
    }).sort({ createdAt: -1 });

    res.json(pendingVendors);
  } catch (err) {
    console.error("FETCH PENDING VENDORS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch vendors" });
  }
});

/* =========================================================
   APPROVE / REJECT VENDOR
   🔥 APPROVE = PUBLISH TO DOCTORS
========================================================= */
router.patch("/vendors/:id", async (req, res) => {
  const { status } = req.body;

  if (!["APPROVED", "REJECTED"].includes(status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  try {
    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    /* ================= UPDATE STATUS ================= */
    vendor.status = status;
    await vendor.save();

    /* ================= CREATE DOCTOR ================= */
    if (status === "APPROVED") {
      const existingDoctor = await Doctor.findOne({
        vendorId: vendor._id
      });

      if (!existingDoctor) {
        console.log(
          "PUBLISHING VENDOR AS DOCTOR 👉",
          vendor.name
        );

        await Doctor.create({
          vendorId: vendor._id,

          // 🔥 REQUIRED BY /api/doctors
          name: vendor.name?.trim() || "Unnamed Clinic",
          focus_area: vendor.speciality || vendor.category || "General",
          speciality: vendor.speciality || vendor.category || "General",

          clinic_name: vendor.name?.trim() || "Clinic",
          address1: vendor.address || "",
          city: vendor.state || "",

          zip_code: "",
          experience: "",
          Rokka: "",

          latitude: null,
          longitude: null,

          profile_url: null,
          reviews: null
        });
      }
    }

    res.json({
      message:
        status === "APPROVED"
          ? "Vendor approved and published to doctors"
          : "Vendor rejected successfully"
    });
  } catch (err) {
    console.error("STATUS UPDATE ERROR:", err);
    res.status(500).json({ message: "Update failed" });
  }
});

module.exports = router;
