const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const bookingRoutes = require("./routes/bookingRoutes");


const Doctor = require("./models/Doctor");

const vendorRoutes = require("./routes/vendors");

const app = express();

const adminRoutes = require("./routes/admin");


/* ================= MIDDLEWARE ================= */

app.use(cors());
app.use(express.json());
app.use("/api/vendors", vendorRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);




/* ================= MONGODB CONNECTION ================= */

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

/* ================= HEALTH CHECK ================= */

app.get("/", (req, res) => {
  res.send("Healzone backend running 🚀");
});

/* =========================================================
   HELPER: Normalize Excel-style consultation_hours
========================================================= */

function normalizeConsultationHours(doc) {
  const hours = [];

  Object.keys(doc).forEach((key) => {
    if (key.startsWith("consultation_hours[")) {
      const h = doc[key];

      // keep only valid rows
      if (h && (h.from || h.to)) {
        hours.push({
          day: h.day,
          from: h.from,
          to: h.to
        });
      }
    }
  });

  return hours;
}

/* =========================================================
   GET ALL DOCTORS (LIST PAGE)
========================================================= */

app.get("/api/doctors", async (req, res) => {
  try {
    const rows = await Doctor.find({
      name: { $exists: true, $ne: "" }
    }).sort({ name: 1 });

    const doctorMap = {};

    rows.forEach((d) => {
      const key = d.name.trim().toLowerCase();

      if (!doctorMap[key]) {
        doctorMap[key] = {
          id: d._id.toString(),
          name: d.name,
          speciality:
            d.focus_area || d.speciality || "Specialization not listed",

          hospital: d.clinic_name || "",

          address1: d.address1 || "",
          city: d.city || "",
          zip_code: d.zip_code || "",

          latitude: d.latitude || null,
          longitude: d.longitude || null,

          Rokka: d.Rokka,
          experience: d.experience || "",
          about: d.discription || "",

          profile_url:
            d.profile_url && d.profile_url.trim() !== ""
              ? d.profile_url
              : null
        };
      }
    });

    res.json(Object.values(doctorMap));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch doctors" });
  }
});

/* =========================================================
   GET SINGLE DOCTOR BY ID (PROFILE PAGE)
========================================================= */

app.get("/api/doctors/:id", async (req, res) => {
  try {
    const row = await Doctor.findById(req.params.id);

    if (!row) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const consultationHours = normalizeConsultationHours(row._doc);

    const doctor = {
      id: row._id.toString(),
      name: row.name,

      // shown under name
      speciality:
        row.focus_area || row.speciality || "Specialization not listed",

      // 🔥 REQUIRED BY FRONTEND
      focus_area: row.focus_area || "",
      about: row.discription || "",
      reviews: row.reviews || null,

      Rokka: row.Rokka,
      experience: row.experience || "",

      profile_url:
        row.profile_url && row.profile_url.trim() !== ""
          ? row.profile_url
          : null,

      // 🔥 CLINIC INFO
      address1: row.address1 || row.address || row.clinic_address || "",

      city: row.city || "",
      zip_code: row.zip_code || "",

      latitude: row.latitude || null,
      longitude: row.longitude || null,

      // 🔥 SLOT DATA
      consultation_hours: consultationHours
    };

    res.json(doctor);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Invalid doctor ID" });
  }
});

/* ================= START SERVER ================= */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
