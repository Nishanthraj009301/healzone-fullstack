const mongoose = require("mongoose");

const salonBookingSchema = new mongoose.Schema(
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

    salonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Salon",
      required: true,
    },

    serviceId: String,

    salonName: String,

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

module.exports = mongoose.model("SalonBooking", salonBookingSchema);