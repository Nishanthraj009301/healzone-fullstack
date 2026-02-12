const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// 🔥 THIS LINE IS NON-NEGOTIABLE
app.use("/api/bookings", require("./routes/bookingRoutes"));

module.exports = app;
