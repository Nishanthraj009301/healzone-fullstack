const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

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

mobileNumber: {
  type: String,
  required: false,
  trim: true,
},

password: {
  type: String,
  minlength: 6,
},

role: {
  type: String,
  enum: ["patient", "admin", "vendor"],
  default: "patient",
},

/* ===============================
   AUTH PROVIDER
=============================== */

authProvider: {
  type: String,
  enum: ["local", "google"],
  default: "local",
},

googleId: {
  type: String,
},

profileImage: {
  type: String,
},

/* ===============================
   EMAIL VERIFICATION
=============================== */

isVerified: {
  type: Boolean,
  default: false,
},

emailOTP: {
  type: String,
},

emailOTPExpires: {
  type: Date,
},

/* ===============================
   SECURITY FEATURES
=============================== */

failedLoginAttempts: {
  type: Number,
  default: 0,
},

lockUntil: {
  type: Date,
},

/* ===============================
   PASSWORD RESET
=============================== */

passwordResetToken: {
  type: String,
},

passwordResetExpires: {
  type: Date,
},

/* ===============================
   VENDOR ONBOARDING
=============================== */

vendorProfileCompleted: {
  type: Boolean,
  default: false,
},


},
{
timestamps: true,
}
);

/* ===============================
HASH PASSWORD BEFORE SAVE
=============================== */

userSchema.pre("save", async function () {

  if (!this.password) return;

  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 10);

});
/* ===============================
PASSWORD COMPARISON
=============================== */

userSchema.methods.matchPassword = async function (enteredPassword) {
return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
