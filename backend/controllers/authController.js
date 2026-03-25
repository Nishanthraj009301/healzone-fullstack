const Vendor = require("../models/Vendor");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const User = require("../models/User");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/* ================= HELPER: GENERATE TOKEN ================= */

const generateToken = (res, userId) => {

const isProduction = process.env.NODE_ENV === "production";

const token = jwt.sign(
{ id: userId },
process.env.JWT_SECRET,
{ expiresIn: "365d" }
);

res.cookie("token", token, {
httpOnly: true,
secure: isProduction,       // production
sameSite: isProduction ? "none" : "lax",
maxAge: 365 * 24 * 60 * 60 * 1000,
path: "/",
});

// res.cookie("token", token, {
//   httpOnly: true,
//   secure: false,        // localhost
//   sameSite: "lax",      // ✅ CORRECT
//   maxAge: 365 * 24 * 60 * 60 * 1000,
//   path: "/",
// });

};

/* ================= REGISTER (PATIENT) ================= */

exports.register = async (req, res) => {

try {


const { name, email, password } = req.body;

if (!name || !email || !password) {
  return res.status(400).json({ message: "All fields required" });
}

const existingUser = await User.findOne({ email });

if (existingUser) {
  return res.status(400).json({ message: "Email already registered" });
}

const user = await User.create({
  name,
  email,
  password,
  role: "patient",
  authProvider: "local",
  isVerified: true,
});

try {
  await sendEmail({
    to: user.email,
    subject: "Welcome to HealZone 🎉",
    html: `
    <h2>Welcome to HealZone</h2>
    <p>Hello ${user.name},</p>
    <p>Your account has been created successfully.</p>
    `,
  });
} catch (err) {
  console.log("Email failed:", err.message);
}

generateToken(res, user._id);

res.status(201).json({
  message: "Registration successful",
  user: {
    id: user._id,
    name: user.name,
    email: user.email,
  },
});


} catch (err) {
console.error(err);
res.status(500).json({ message: "Server error" });
}

};

/* ================= LOGIN ================= */

exports.login = async (req, res) => {

try {


const { email, password } = req.body;

const user = await User.findOne({ email });

if (!user) {
  return res.status(400).json({ message: "Invalid credentials" });
}

if (user.authProvider === "google") {
  return res.status(400).json({
    message: "Please login using Google",
  });
}

const isMatch = await bcrypt.compare(password, user.password);

if (!isMatch) {
  return res.status(400).json({ message: "Invalid credentials" });
}

generateToken(res, user._id);

res.json({
  message: "Login successful",
  user: {
    id: user._id,
    name: user.name,
    email: user.email,
  },
});


} catch (err) {
res.status(500).json({ message: err.message });
}

};

/* ================= GOOGLE LOGIN (PATIENT) ================= */

exports.googlePatientLogin = async (req, res) => {

try {


const { token } = req.body;

const ticket = await client.verifyIdToken({
  idToken: token,
  audience: process.env.GOOGLE_CLIENT_ID,
});

const { sub, name, email, picture } = ticket.getPayload();

let user = await User.findOne({ email });

if (user && user.role !== "patient") {
  return res.status(403).json({
    message: "Account not registered as patient",
  });
}

if (!user) {
  user = await User.create({
    name,
    email,
    googleId: sub,
    profileImage: picture,
    authProvider: "google",
    role: "patient",
    isVerified: true,
    password: Math.random().toString(36),
  });
}

generateToken(res, user._id);

res.json({
  message: "Google login successful",
  user: {
    id: user._id,
    name: user.name,
    email: user.email,
  },
});


} catch (err) {
res.status(401).json({ message: "Google authentication failed" });
}

};

/* ================= LOGOUT ================= */

exports.logout = (req, res) => {

const isProduction = process.env.NODE_ENV === "production";

res.clearCookie("token", {
httpOnly: true,
secure: isProduction,
sameSite: isProduction ? "none" : "lax",
path: "/",
});

res.json({ message: "Logged out successfully" });

};

/* ================= GET ME ================= */

exports.getMe = async (req, res) => {

try {


const user = await User.findById(req.user.id)
  .select("name email role");

if (!user) {
  return res.status(404).json({ message: "User not found" });
}

res.json({
  user: {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role
  }
});


} catch (err) {
console.error("GET ME ERROR:", err);
res.status(500).json({ message: "Failed to fetch user" });
}

};

/* ================= FORGOT PASSWORD ================= */

exports.forgotPassword = async (req, res) => {

try {


const { email } = req.body;

const user = await User.findOne({ email });

if (!user) {
  return res.status(404).json({ message: "User not found" });
}

const resetToken = crypto.randomBytes(32).toString("hex");

user.passwordResetToken = resetToken;
user.passwordResetExpires = Date.now() + 60 * 60 * 1000;

await user.save();

const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

await sendEmail({
  to: user.email,
  subject: "HealZone Password Reset",
  html: `
  <p>Hello ${user.name}</p>
  <p>Reset password:</p>
  <a href="${resetUrl}">Reset Password</a>
  `,
});

res.json({ message: "Password reset link sent to email" });


} catch (err) {
res.status(500).json({ message: "Failed to send reset email" });
}

};

/* ================= RESET PASSWORD ================= */

exports.resetPassword = async (req, res) => {

try {


const { token } = req.params;
const { password } = req.body;

const user = await User.findOne({
  passwordResetToken: token,
  passwordResetExpires: { $gt: Date.now() }
});

if (!user) {
  return res.status(400).json({ message: "Invalid or expired token" });
}

user.password = password;

user.passwordResetToken = undefined;
user.passwordResetExpires = undefined;

await user.save();

res.json({ message: "Password reset successful" });


} catch (err) {
res.status(500).json({ message: "Password reset failed" });
}

};

/* ================= UPDATE PROFILE ================= */

exports.updateProfile = async (req, res) => {

try {

const userId = req.user.id;

const { name, email, gender, dob } = req.body;

const updatedUser = await User.findByIdAndUpdate(
  userId,
  { name, email, gender, dob },
  { new: true }
);

res.json({
  message: "Profile updated successfully",
  user: {
    id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    gender: updatedUser.gender || "",
    dob: updatedUser.dob || "",
  }
});


} catch (error) {
console.error(error);
res.status(500).json({ message: "Server error" });
}

};

/* ================= GOOGLE VENDOR LOGIN ================= */

exports.googleVendorLogin = async (req, res) => {

try {


const { credential } = req.body;

const ticket = await client.verifyIdToken({
  idToken: credential,
  audience: process.env.GOOGLE_CLIENT_ID,
});

const { sub, name, email, picture } = ticket.getPayload();

let user = await User.findOne({ email });

if (user && user.role !== "vendor") {
  return res.status(403).json({
    message: "Account already registered as different role",
  });
}

if (!user) {
  user = await User.create({
    name,
    email,
    googleId: sub,
    profileImage: picture,
    authProvider: "google",
    role: "vendor",
    isVerified: true,
    password: Math.random().toString(36),
  });
}

generateToken(res, user._id);

res.json({
  message: "Vendor Google login successful",
  user: {
    id: user._id,
    name: user.name,
    email: user.email,
  },
});

} catch (err) {
res.status(401).json({ message: "Google authentication failed" });
}

};

/* ================= REGISTER VENDOR ================= */

exports.registerVendor = async (req, res) => {

try {

  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      message: "Name, email and password required"
    });
  }

  /* Check if vendor already exists */

  const existingVendor = await Vendor.findOne({ email });

  if (existingVendor) {
    return res.status(400).json({
      message: "Vendor with this email already exists"
    });
  }

  /* Hash password */

  const hashedPassword = await bcrypt.hash(password, 10);

  /* Split name into first + last */

  const nameParts = name.trim().split(" ");
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(" ") || "";

  /* Create vendor account */

  const vendor = await Vendor.create({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    mobile: "",   // will be filled in service form
    status: "PENDING"
  });

  generateToken(res, vendor._id);

  res.status(201).json({
    message: "Vendor account created successfully",
    vendorId: vendor._id
  });

} catch (err) {

  console.error(err);

  res.status(500).json({
    message: "Vendor registration failed"
  });

}

};
