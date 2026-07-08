const mongoose = require("mongoose");

const fitnessBookingSchema = new mongoose.Schema(
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

    fitnessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Fitness",
      required: true,
    },

    serviceId: String,

    fitnessName: String,

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

module.exports = mongoose.model("FitnessBooking", fitnessBookingSchema);