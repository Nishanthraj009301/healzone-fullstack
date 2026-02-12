const mongoose = require("mongoose");

/**
 * HYBRID Doctor Schema
 * - Explicit fields for app usage
 * - Flexible for CSV ingestion
 */
const doctorSchema = new mongoose.Schema(
  {
    /* ================= CORE APP FIELDS ================= */

    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      index: true
    },

    name: {
      type: String,
      trim: true,
      index: true
    },

    speciality: {
      type: String,
      trim: true
    },

    focus_area: {
      type: String,
      trim: true
    },

    clinic_name: {
      type: String,
      trim: true
    },

    address1: {
      type: String,
      trim: true
    },

    city: {
      type: String,
      trim: true
    },

    zip_code: {
      type: String
    },

    experience: {
      type: String
    },

    Rokka: {
      type: String
    },

    profile_url: {
      type: String
    },

    reviews: {
      type: mongoose.Schema.Types.Mixed
    },

    latitude: Number,
    longitude: Number
  },
  {
    strict: false,   // 🔥 still allows CSV extra fields
    timestamps: true
  }
);

module.exports = mongoose.model("Doctor", doctorSchema);
