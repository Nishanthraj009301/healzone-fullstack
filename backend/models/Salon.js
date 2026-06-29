const mongoose = require("mongoose");

const SalonSchema = new mongoose.Schema({}, {
  strict: false,
  collection: "salons"
});

module.exports = mongoose.model("Salon", SalonSchema);