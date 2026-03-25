const mongoose = require("mongoose");

/* ================= AVAILABILITY SCHEMA ================= */

const availabilitySchema = new mongoose.Schema(
  {
    day: {
      type: String
    },
    start: {
      type: String
    },
    end: {
      type: String
    }
  },
  { _id: false }
);

/* ================= VENDOR SCHEMA ================= */

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

    // display name
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

    speciality: {
      type: String
    },

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

    /* ================= PROFILE ================= */

    photo: {
      type: String
    },

    about: {
      type: String
    },

    /* ================= LOCATION ================= */

    address: {
      type: String
    },

    state: {
      type: String
    },

    country: {
      type: String
    },

    /* GEO LOCATION (MAP PIN) */

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point"
      },

      coordinates: {
        type: [Number], // [longitude, latitude]
        default: undefined
      }
    },

    /* ================= BUSINESS INFO ================= */

    consultationFee: {
      type: Number,
      default: 0
    },

    appointmentDuration: {
      type: Number,
      default: 30
    },

    services: {
      type: String
    },

    /* ================= AVAILABILITY ================= */

    availability: [availabilitySchema],

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

/* ================= GEO INDEX ================= */

vendorSchema.index({ location: "2dsphere" });

/* ================= AUTO GENERATE NAME ================= */

vendorSchema.pre("save", function () {
  this.name = `${this.firstName} ${this.lastName}`;
});

module.exports = mongoose.model("Vendor", vendorSchema);