const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    referenceNumber: {
      type: String,
      default: "",
    },

    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      default: null, // ✅ NOT REQUIRED anymore
    },

    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      default: null,
    },

    bookingDate: {
      type: Date,
      default: Date.now, // ✅ safe default
    },

    bookingTime: {
      type: String,
      default: "",
    },

    fullName: {
      type: String,
      default: "",
    },

    email: {
      type: String,
      default: "",
    },

    phone: {
      type: String,
      default: "",
    },

    consultationFee: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "CANCELLED"],
      default: "CONFIRMED",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
