const mongoose = require("mongoose");

const SpaSchema = new mongoose.Schema({}, {
  strict: false,
  collection: "spas"
});

module.exports = mongoose.model("Spa", SpaSchema);