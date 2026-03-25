const express = require("express");
const router = express.Router();

const Vendor = require("../models/Vendor");
const DoctorLive = require("../models/DoctorLive");

/* ================= ADMIN LOGIN ================= */
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (
    username === process.env.ADMIN_USER &&
    password === process.env.ADMIN_PASS
  ) {
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
   APPROVE = PUBLISH TO DoctorLive COLLECTION
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

    /* ================= CREATE OR UPDATE DOCTORLIVE ================= */
    if (status === "APPROVED") {

      console.log("SYNCING VENDOR → DOCTORLIVE 👉", vendor.name);

      /* ===== LOCATION HANDLING ===== */
      let location = null;

      if (vendor.location?.coordinates?.length === 2) {
        location = {
          type: "Point",
          coordinates: vendor.location.coordinates
        };
      }

      /* ===== MAP AVAILABILITY ===== */
      const consultationHours = Array.isArray(vendor.availability)
        ? vendor.availability.map(slot => ({
            day: slot.day,
            start: slot.start,
            end: slot.end
          }))
        : [];

      await DoctorLive.findOneAndUpdate(
        { vendorId: vendor._id },
        {
          vendorId: vendor._id,

          name: vendor.name?.trim() || "Unnamed Clinic",

          focus_area: vendor.speciality || vendor.category || "General",
          speciality: vendor.speciality || vendor.category || "General",

          clinic_name: vendor.name?.trim() || "Clinic",

          address1: vendor.address || "",
          city: vendor.state || "",

          zip_code: "",
          experience: "",
          Rokka: "",

          latitude: vendor.location?.coordinates?.[1] || null,
          longitude: vendor.location?.coordinates?.[0] || null,

          location,

          consultation_hours: consultationHours,

          profile_url: null,
          reviews: null
        },
        { upsert: true, new: true }
      );
    }

    res.json({
      message:
        status === "APPROVED"
          ? "Vendor approved and doctor synced successfully"
          : "Vendor rejected successfully"
    });

  } catch (err) {
    console.error("STATUS UPDATE ERROR:", err);
    res.status(500).json({ message: "Update failed" });
  }
});

module.exports = router;