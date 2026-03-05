const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const bookingRoutes = require("./routes/bookingRoutes");
const vendorRoutes = require("./routes/vendors");
const adminRoutes = require("./routes/admin");
const authRoutes = require("./routes/authRoutes");

const Doctor = require("./models/Doctor");

const app = express();

/* =========================================================
   🔥 TRUST PROXY (IMPORTANT FOR SECURE COOKIES IN PROD)
========================================================= */
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

/* =========================================================
   MIDDLEWARE
========================================================= */

const allowedOrigins = [
  "http://localhost:3000",           // local development
  "https://heal-zone.netlify.app",   // production frontend
];

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// ✅ Body parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ✅ Cookie parser (for JWT in cookies)
app.use(cookieParser());

// ✅ Debug middleware (remove in production)
if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    console.log("➡️ Incoming:", req.method, req.url);
    next();
  });
}

function getDistanceInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in KM
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/* =========================================================
   ROUTES
========================================================= */

app.use("/api/auth", authRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);

/* =========================================================
   AUTOMATION API (FOR BOOKING AUTOMATION TEAM)
========================================================= */

app.post("/api/automation", (req, res) => {
  console.log("🤖 Automation Request Received:");
  console.log(JSON.stringify(req.body, null, 2));

  res.json({
    success: true,
    message: "Automation payload received",
  });
});

/* =========================================================
   HEALTH CHECK
========================================================= */

app.get("/", (req, res) => {
  res.send("Healzone backend running 🚀");
});

/* =========================================================
   EMAIL TEST ROUTE
========================================================= */

app.get("/test-email", async (req, res) => {
  try {
    const sendEmail = require("./utils/sendEmail");

    await sendEmail({
      to: "yourpersonalemail@gmail.com", // change this
      subject: "Test Email from HealZone",
      html: "<h1>Email system is working ✅</h1>",
    });

    res.send("Email sent successfully");
  } catch (err) {
    console.error("EMAIL TEST ERROR:", err);
    res.status(500).send(err.message);
  }
});

/* =========================================================
   HELPER: Normalize Excel-style consultation_hours
========================================================= */

function normalizeConsultationHours(doc) {
  const hours = [];

  Object.keys(doc).forEach((key) => {
    if (key.startsWith("consultation_hours[")) {
      const h = doc[key];

      if (h && (h.from || h.to)) {
        hours.push({
          day: h.day,
          from: h.from,
          to: h.to,
        });
      }
    }
  });

  return hours;
}

/* =========================================================
   GET DOCTORS (STRICT FILTER + 10KM PRIORITY + A-Z SORT)
========================================================= */

app.get("/api/doctors", async (req, res, next) => {
  console.log("🔥 NEW VERSION RUNNING");
  try {
    const { speciality, country, city, lat, lng, search } = req.query;

    let filter = {
      name: { $exists: true, $ne: "" },
    };

    // =====================================================
// ✅ Speciality Filter
// =====================================================
if (speciality) {
  const normalized = speciality.trim();

  filter.$or = [
    { speciality: { $regex: normalized, $options: "i" } },
    { focus_area: { $regex: `^${normalized}`, $options: "i" } }
  ];
}

// =====================================================
// ✅ Global Search (Name + Speciality + Focus Area)
// =====================================================
if (search) {
  const q = search.trim();

  const searchCondition = {
    $or: [
      { name: { $regex: q, $options: "i" } },
      { speciality: { $regex: q, $options: "i" } },
      { focus_area: { $regex: q, $options: "i" } }
    ]
  };

  // If speciality already exists, combine both
  if (filter.$or) {
    filter = {
      ...filter,
      $and: [
        { $or: filter.$or },
        searchCondition
      ]
    };
    delete filter.$or;
  } else {
    Object.assign(filter, searchCondition);
  }
}
    // =====================================================
// ✅ Country Filter
// =====================================================
if (country) {
  filter.country = { $regex: country, $options: "i" };
}

// =====================================================
// ✅ City Filter
// =====================================================
if (city) {
  filter.$or = [
    { city: { $regex: city, $options: "i" } },
    { state: { $regex: city, $options: "i" } }
  ];
}

    // =====================================================
    // FETCH DOCTORS (Single Query Only)
    // =====================================================

    console.log("Applied Filter:", filter);
    let rows = await Doctor.find(filter)
      .collation({ locale: "en", strength: 2 })
      .lean();

    // =====================================================
    // ✅ IF LOCATION PROVIDED → PRIORITIZE 10KM
    // =====================================================
    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);

      rows = rows.map((doc) => {
        let distance = Infinity;

        if (doc.location && doc.location.coordinates) {
          const [docLng, docLat] = doc.location.coordinates;

          distance = getDistanceInKm(
            userLat,
            userLng,
            docLat,
            docLng
          );
        }

        return { ...doc, distance };
      });

      // Sort: within 10km first, then alphabetical
      rows.sort((a, b) => {
        const aInRange = a.distance <= 10;
        const bInRange = b.distance <= 10;

        if (aInRange && !bInRange) return -1;
        if (!aInRange && bInRange) return 1;

        return a.name.localeCompare(b.name);
      });
    } else {
      // No location → just alphabetical
      rows.sort((a, b) => a.name.localeCompare(b.name));
    }

    // =====================================================
    // MAP RESPONSE (Prevent duplicate names)
    // =====================================================
    res.json(
  rows.map((d) => ({
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
        : null,
  }))
);
  } catch (err) {
    next(err);
  }
});

/* =========================================================
   GET SINGLE DOCTOR
========================================================= */

app.get("/api/doctors/:id", async (req, res, next) => {
  try {
    const row = await Doctor.findById(req.params.id);

    if (!row) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const consultationHours = normalizeConsultationHours(row._doc);

    const doctor = {
      _id: row._id.toString(),
      name: row.name,
      speciality:
        row.focus_area || row.speciality || "Specialization not listed",
      focus_area: row.focus_area || "",
      about: row.discription || "",
      reviews: row.reviews || null,
      Rokka: row.Rokka,
      experience: row.experience || "",
      profile_url:
        row.profile_url && row.profile_url.trim() !== ""
          ? row.profile_url
          : null,
      address1: row.address1 || row.address || row.clinic_address || "",
      city: row.city || "",
      zip_code: row.zip_code || "",
      latitude: row.latitude || null,
      longitude: row.longitude || null,
      consultation_hours: consultationHours,
    };

    res.json(doctor);
  } catch (err) {
    next(err);
  }
});

/* =========================================================
   GLOBAL ERROR HANDLER
========================================================= */

app.use((err, req, res, next) => {
  console.error("🔥 GLOBAL ERROR:", err.message);

  res.status(500).json({
    message: "Something went wrong",
    error:
      process.env.NODE_ENV === "production"
        ? undefined
        : err.message,
  });
});

/* =========================================================
   MONGODB CONNECTION + START SERVER
========================================================= */

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });