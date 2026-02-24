const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.protect = async (req, res, next) => {
  try {
    let token;

    if (req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      console.log("❌ No token found");
      return res.status(401).json({ message: "Not authorized" });
    }

    console.log("✅ Token received:", token);
    console.log("🔐 JWT_SECRET:", process.env.JWT_SECRET);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("✅ Decoded ID:", decoded.id);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      console.log("❌ User not found in DB");
      return res.status(401).json({ message: "User not found" });
    }

    console.log("✅ User found:", user._id);

    req.user = user;
    next();

  } catch (error) {
    console.log("❌ JWT ERROR:", error.message);
    return res.status(401).json({ message: error.message });
  }
};