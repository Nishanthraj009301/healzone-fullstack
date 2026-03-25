const Vendor = require("../models/Vendor");
const bcrypt = require("bcryptjs");

exports.registerVendor = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      category,
      speciality,
      mobile,
      email,
      password,
      address,
      state,
      country,
      consultationFee,
      appointmentDuration,
      services,
      availability,
      location,
      about
    } = req.body;

  console.log("=========== DEBUG START ===========");
console.log("BODY KEYS:", Object.keys(req.body));
console.log("FULL BODY:", JSON.stringify(req.body, null, 2));
console.log("availability field:", req.body.availability);
console.log("=========== DEBUG END ===========");

    /* ================= CHECK EXISTING ================= */

    const existingVendor = await Vendor.findOne({ email });

    if (existingVendor) {
      return res.status(400).json({
        message: "Vendor already exists with this email"
      });
    }

    /* ================= HASH PASSWORD ================= */

    const hashedPassword = await bcrypt.hash(password, 10);

    /* ================= PARSE AVAILABILITY ================= */

    let parsedAvailability = [];

    // 🔴 CASE 1: Bracket format (FormData issue)
    if (Object.keys(req.body).some(key => key.startsWith("availability["))) {
      const temp = {};

      Object.keys(req.body).forEach((key) => {
        const match = key.match(/availability\[(\d+)\]\[(\w+)\]/);
        if (match) {
          const index = match[1];
          const field = match[2];

          if (!temp[index]) temp[index] = {};
          temp[index][field] = req.body[key];
        }
      });

      parsedAvailability = Object.values(temp);
    }

    // 🔴 CASE 2: String (JSON string from FormData)
    else if (typeof availability === "string") {
      try {
        parsedAvailability = JSON.parse(availability);
      } catch (err) {
        console.log("Availability parse error:", err);
        parsedAvailability = [];
      }
    }

    // 🔴 CASE 3: Already array
    else if (Array.isArray(availability)) {
      parsedAvailability = availability;
    }

    console.log("FINAL parsedAvailability:", parsedAvailability);

    /* ================= CREATE VENDOR ================= */

    const vendor = new Vendor({
      firstName,
      lastName,
      name: `${firstName} ${lastName}`,

      category,
      speciality: speciality || "",

      mobile,
      email,
      password: hashedPassword,

      address: address || "",
      state: state || "",
      country: country || "",

      consultationFee: consultationFee ? Number(consultationFee) : 0,
      appointmentDuration: appointmentDuration
        ? Number(appointmentDuration)
        : 30,

      // ✅ FIXED services
      services: Array.isArray(services) ? services : [],

      about: about || "",

      // ✅ FINAL AVAILABILITY
      availability: parsedAvailability,

      /* ================= MAP LOCATION ================= */

      location:
        location &&
        location.coordinates &&
        location.coordinates.length === 2
          ? {
              type: "Point",
              coordinates: location.coordinates
            }
          : undefined
    });

    await vendor.save();

    console.log("SAVED VENDOR:", vendor);

    res.status(201).json({
      message: "Vendor registered successfully",
      vendor
    });

  } catch (error) {
    console.error("Vendor Registration Error:", error);

    res.status(500).json({
      message: "Server error"
    });
  }
};