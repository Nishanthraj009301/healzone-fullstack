const mongoose = require("mongoose");

const DoctorLiveSchema = new mongoose.Schema(
  {
    vendorId: mongoose.Schema.Types.ObjectId,

    name: String,
    speciality: String,
    clinic_name: String,

    address1: String,
    city: String,

    latitude: Number,
    longitude: Number,

    location: {
      type: {
        type: String,
        enum: ["Point"]
      },
      coordinates: [Number]
    },

    consultation_hours: [
      {
        day: String,
        start: String,
        end: String
      }
    ],

    profile_url: String,
    reviews: Object
  },
  { timestamps: true }
);

DoctorLiveSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("DoctorLive", DoctorLiveSchema);