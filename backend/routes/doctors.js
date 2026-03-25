const express = require("express");
const router = express.Router();

const Doctor = require("../models/Doctor");
const DoctorLive = require("../models/DoctorLive");
const Vendor = require("../models/Vendor");

/* ================= GET ALL DOCTORS ================= */

router.get("/", async (req, res) => {
  try {

    const oldDoctors = await Doctor.find();
    const liveDoctors = await DoctorLive.find();

    // Fetch vendor doctors
    const vendorDoctors = await Vendor.find({ category: "Doctor", isActive: true });

    const formattedVendors = vendorDoctors.map(v => ({
      _id: v._id,
      name: v.name,
      speciality: v.speciality,
      city: v.city,
      profile_url: v.photo
  ? `${API}/uploads/${v.photo}`
  : null,
      consultationFee: v.consultationFee,

      consultation_hours: (v.availability || []).map(a => ({
        day: a.day,
        from: a.start,
        to: a.end
      })),

      appointmentDuration: v.appointmentDuration || 30,
      vendorId: v._id
    }));

    const allDoctors = [
      ...oldDoctors,
      ...liveDoctors,
      ...formattedVendors
    ];

    res.json(allDoctors);

  } catch (err) {
    console.error("FETCH DOCTORS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch doctors" });
  }
});


/* ================= GET SINGLE DOCTOR ================= */

router.get("/:id", async (req, res) => {
  try {

    let doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      doctor = await DoctorLive.findById(req.params.id);
    }

    // If not found in Excel or Live doctors, check Vendor
    if (!doctor) {

      const vendor = await Vendor.findById(req.params.id);

      if (vendor && vendor.category === "Doctor") {

        doctor = {
          _id: vendor._id,

          name: vendor.name,
          speciality: vendor.speciality,
          focus_area: vendor.speciality || "",
          about: "",
          experience: "",
          reviews: { overall_rating: null },

          // IMAGE
          profile_url: vendor.photo
            ? `http://localhost:5000/uploads/${vendor.photo}`
            : null,

          // ADDRESS
          address1: vendor.address || "",
          city: vendor.city || "",
          zip_code: vendor.zip_code || "",

          // LOCATION
          latitude: vendor.location?.coordinates?.[1] || null,
          longitude: vendor.location?.coordinates?.[0] || null,

          // FEES
          consultationFee: vendor.consultationFee || 0,
          Rokka: vendor.consultationFee || 0,

          // CONSULTATION HOURS
          consultation_hours: (vendor.availability || []).map(a => ({
            day: a.day,
            from: a.start,
            to: a.end
          })),

          appointmentDuration: vendor.appointmentDuration || 30,

          vendorId: vendor._id
        };

      }

    }

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.json(doctor);

  } catch (err) {
    console.error("FETCH DOCTOR ERROR:", err);
    res.status(500).json({ message: "Failed to fetch doctor" });
  }
});

module.exports = router;