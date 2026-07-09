const mongoose = require("mongoose");

const MentalHealthBookingSchema = new mongoose.Schema(
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

    mentalHealthId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MentalHealth",
      required: true,
    },

    mentalHealthName: {
      type: String,
      required: true,
    },

    serviceId: {
      type: String,
      required: true,
    },

    serviceName: {
      type: String,
      required: true,
    },

    servicePrice: {
      type: String,
      required: true,
    },

    bookingDate: {
      type: Date,
      required: true,
    },

    bookingTime: {
      type: String,
      required: true,
    },

    customerName: {
      type: String,
      required: true,
    },

    customerEmail: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["CONFIRMED", "CANCELLED", "COMPLETED"],
      default: "CONFIRMED",
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.MentalHealthBooking ||
  mongoose.model(
    "MentalHealthBooking",
    MentalHealthBookingSchema
  );