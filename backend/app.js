const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

const allowedOrigins = [
  "http://localhost:3000",          // ✅ local dev
  "https://heal-zone.netlify.app"   // ✅ production
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/bookings", require("./routes/bookingRoutes"));
app.use("/api/doctors", require("./routes/doctors")); // ✅ NEW ROUTE


module.exports = app;