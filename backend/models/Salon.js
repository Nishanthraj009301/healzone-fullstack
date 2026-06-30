const mongoose = require("mongoose");

const SalonSchema = new mongoose.Schema({}, {
  strict: false,
  collection: "spas"
});

module.exports =
  mongoose.models.Salon || mongoose.model("Salon", SalonSchema);