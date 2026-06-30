const mongoose = require("mongoose");

const spaBookingSchema = new mongoose.Schema(
  {
    referenceNumber: {
      type: String,
      required: true,
      unique: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    spaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Spa",
      required: true,
    },

    serviceId: String,

    spaName: String,

    serviceName: String,

    servicePrice: String,

    bookingDate: Date,

    bookingTime: String,

    customerName: String,

    customerEmail: String,

    status: {
      type: String,
      enum: ["CONFIRMED", "CANCELLED"],
      default: "CONFIRMED",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("SpaBooking", spaBookingSchema);