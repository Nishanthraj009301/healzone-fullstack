const Vendor = require("../models/Vendor");
const Doctor = require("../models/Doctor");

/* ===============================
   APPROVE VENDOR → PUBLISH DOCTOR
================================= */

exports.approveVendor = async (req, res) => {
  try {

    const vendorId = req.params.id;

    const vendor = await Vendor.findById(vendorId);

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    // create doctor from vendor
    const doctor = new Doctor({
      name: vendor.name,
      category: vendor.category,
      speciality: vendor.speciality,
      mobile: vendor.mobile,
      email: vendor.email,

      location: vendor.location,

      // copy vendor availability
      consultation_hours: vendor.availability
    });

    await doctor.save();

    vendor.status = "approved";
    await vendor.save();

    res.json({
      message: "Vendor approved and doctor published",
      doctor
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};