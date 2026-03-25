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
const Booking = require("./models/Booking");
const Vendor = require("./models/Vendor");
const path = require("path");

const app = express();

const session = require("express-session");

/* =========================================================
   TRUST PROXY
========================================================= */

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

/* =========================================================
   MIDDLEWARE
========================================================= */

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    console.log("➡️ Incoming:", req.method, req.url);
    next();
  });
}

app.use(
  session({
    secret: "healzone-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false
    }
  })
);


/* =========================================================
   ROUTES
========================================================= */

app.use("/api/auth", authRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);


/* =========================================================
   HELPER FUNCTIONS
========================================================= */

function getDistanceInKm(lat1, lon1, lat2, lon2) {
  const R = 6371;

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
   GENERATE TIME SLOTS
========================================================= */

function generateSlots(start, end, duration = 30) {

  if (!start || !end) return [];

  const slots = [];

  const [startHour, startMinute] = start.split(":").map(Number);
  const [endHour, endMinute] = end.split(":").map(Number);

  let currentMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;

  while (currentMinutes < endMinutes) {

    const hours = Math.floor(currentMinutes / 60)
      .toString()
      .padStart(2, "0");

    const minutes = (currentMinutes % 60)
      .toString()
      .padStart(2, "0");

    slots.push(`${hours}:${minutes}`);

    currentMinutes += duration;
  }

  return slots;
}

/* =========================================================
   NORMALIZE CONSULTATION HOURS
========================================================= */

function normalizeConsultationHours(doc) {

  const hours = [];

  /* ================= VENDOR AVAILABILITY ================= */

  if (Array.isArray(doc.availability)) {

    doc.availability.forEach(h => {

      if (h && h.start && h.end) {

        hours.push({
          day: h.day,
          from: h.start,
          to: h.end
        });

      }

    });

  }

  /* ================= NEW VENDOR CONSULTATION FORMAT ================= */

  if (Array.isArray(doc.consultation_hours)) {

    doc.consultation_hours.forEach(h => {

      if (h && (h.from || h.start || h.to || h.end)) {

        hours.push({
          day: h.day,
          from: h.start || h.from,
          to: h.end || h.to
        });

      }

    });

  }

  /* ================= EXCEL OBJECT FORMAT ================= */

  Object.keys(doc).forEach((key) => {

    if (key.startsWith("consultation_hours[") && typeof doc[key] === "object") {

      const h = doc[key];

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
   GET DOCTORS (LIST)
========================================================= */

app.get("/api/doctors", async (req, res, next) => {

  try {

    const { speciality, country, city, lat, lng, search } = req.query;

    let filter = {
      name: { $exists: true, $ne: "" },
    };

    if (speciality) {
      const normalized = speciality.trim();

      filter.$or = [
        { speciality: { $regex: normalized, $options: "i" } },
        { focus_area: { $regex: `^${normalized}`, $options: "i" } }
      ];
    }

    if (search) {
      const q = search.trim();

      const searchCondition = {
        $or: [
          { name: { $regex: q, $options: "i" } },
          { speciality: { $regex: q, $options: "i" } },
          { focus_area: { $regex: q, $options: "i" } }
        ]
      };

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

    if (country) {
      filter.country = { $regex: country, $options: "i" };
    }

    if (city) {
      filter.$or = [
        { city: { $regex: city, $options: "i" } },
        { state: { $regex: city, $options: "i" } }
      ];
    }

    /* FETCH FROM BOTH COLLECTIONS */

 const doctors = await Doctor.find(filter).lean();
const vendors = await Vendor.find({ status: "APPROVED" }).lean();

let rows = [...doctors, ...vendors];

    /* DISTANCE SORT */

    if (lat && lng) {

      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);

      rows = rows.map((doc) => {

        let distance = Infinity;

        if (doc.location?.coordinates) {

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

      rows.sort((a, b) => {

        const aInRange = a.distance <= 10;
        const bInRange = b.distance <= 10;

        if (aInRange && !bInRange) return -1;
        if (!aInRange && bInRange) return 1;

        return a.name.localeCompare(b.name);

      });

    } else {

      rows.sort((a, b) => a.name.localeCompare(b.name));

    }

    res.json(
  rows.map((d) => ({
    _id: d._id.toString(),
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
    const doctorId = req.params.id;
    const date = req.query.date;

    console.log("Requested doctor ID:", doctorId);

    let row = null;

    /* 1️⃣ FIRST CHECK DOCTORS COLLECTION */
    row = await Doctor.findById(doctorId);

    /* 2️⃣ IF NOT FOUND, CHECK VENDORS COLLECTION */
    if (!row) {
      row = await Vendor.findById(doctorId);
    }

    /* 3️⃣ IF STILL NOT FOUND */
    if (!row) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    console.log("Doctor loaded from:", row.constructor.modelName);

    /* =========================================================
       NORMALIZE CONSULTATION HOURS (SUPPORT BOTH FORMATS)
    ========================================================= */

    let consultationHours = [];

    if (row.availability && row.availability.length > 0) {
      // ✅ Vendor format
      consultationHours = row.availability.map(a => ({
        day: a.day,
        from: a.start,
        to: a.end
      }));
    } else {
      // ✅ Practo / old format
      consultationHours = normalizeConsultationHours(row._doc || row);
    }

    console.log("Consultation Hours:", consultationHours);

    /* =========================================================
       GENERATE ALL SLOTS (SAFE)
    ========================================================= */

    let slots = consultationHours.map(h => {
      if (!h.from || !h.to) {
        return { day: h.day, slots: [] };
      }

      const generatedSlots = generateSlots(h.from, h.to);

      console.log("Generating slots from:", h.from, "to", h.to);
      console.log("Generated slots:", generatedSlots);

      return {
        day: h.day,
        slots: generatedSlots
      };
    });

    /* =========================================================
       REMOVE BOOKED SLOTS
    ========================================================= */

    if (date) {
      const bookings = await Booking.find({
        doctorId: doctorId,
        date: date
      }).lean();

      const bookedSlots = bookings.map(b => b.slot);

      slots = slots.map(daySlots => ({
        day: daySlots.day,
        slots: daySlots.slots.filter(
          s => !bookedSlots.includes(s)
        )
      }));
    }

    /* =========================================================
       IMAGE HANDLING (SUPPORT BOTH)
    ========================================================= */

    let profileUrl = null;

    if (row.profile_url && row.profile_url.trim() !== "") {
      // ✅ External or stored URL
      profileUrl = row.profile_url;
    } else if (row.photo) {
      // ✅ Local uploaded image
      profileUrl = `/uploads/${row.photo}`;
    }

    /* =========================================================
       RESPONSE (UNIFIED)
    ========================================================= */

    const doctor = {
      _id: row._id.toString(),
      name: row.name,

      speciality:
        row.focus_area || row.speciality || "Specialization not listed",

      focus_area: row.focus_area || "",
      about: row.discription || "",
      reviews: row.reviews || null,

      // ✅ Fee support both
      Rokka: row.Rokka || row.consultationFee || 0,

      experience: row.experience || "",

      profile_url: profileUrl,

      address1: row.address1 || row.address || "",
      city: row.city || "",
      zip_code: row.zip_code || "",

      latitude: row.latitude || row.location?.coordinates?.[1] || null,
      longitude: row.longitude || row.location?.coordinates?.[0] || null,

      consultation_hours: consultationHours,
      slots: slots
    };

    res.json(doctor);

  } catch (err) {
    next(err);
  }
});

/* =========================================================
   HEALTH CHECK
========================================================= */

app.get("/", (req, res) => {
  res.send("Healzone backend running 🚀");
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
   START SERVER
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