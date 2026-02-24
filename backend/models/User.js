const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    role: {
      type: String,
      enum: ["patient", "admin", "vendor"],
      default: "patient",
    },

    isVerified: {
      type: Boolean,
      default: true, // can change to false if using OTP
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);