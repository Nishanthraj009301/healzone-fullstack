const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema(
  {
    /* ================= BASIC INFO ================= */
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },

    // display name (set explicitly during registration)
    name: {
      type: String,
      trim: true
    },

    category: {
      type: String,
      enum: [
        "Doctor",
        "Mental Health",
        "Physical Health",
        "Spa & Retreats Center",
        "Beauty Parlour"
      ],
      required: true
    },

    speciality: String,

    /* ================= CONTACT ================= */
    mobile: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },

    /* ================= LOCATION ================= */
    address: String,
    state: String,
    country: String,

    /* ================= BUSINESS INFO ================= */
    consultationFee: Number,
    appointmentDuration: Number,
    services: String,

    /* ================= ADMIN APPROVAL ================= */
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING"
    },

    /* ================= FLAGS ================= */
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Vendor", vendorSchema);
