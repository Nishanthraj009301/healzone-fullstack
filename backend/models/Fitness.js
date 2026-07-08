const mongoose = require("mongoose");

const fitnessSchema = new mongoose.Schema(
  {},
  {
    strict: false,
    collection: "fitness",
  }
);

module.exports =
  mongoose.models.Fitness ||
  mongoose.model("Fitness", fitnessSchema);