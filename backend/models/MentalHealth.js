const mongoose = require("mongoose");

const MentalHealthSchema = new mongoose.Schema(
  {
    VenueId: Number,
    VenueName: String,
    Slug: String,

    Rating: Number,
    ReviewsCount: Number,

    Featured: Boolean,

    DistanceKM: Number,
    DistanceFormatted: String,

    ServiceCount: Number,

    AddressJson: {
      latitude: Number,
      longitude: Number,
      simpleFormatted: String,
    },

    ServicesJson: [
      {
        id: String,
        caption: String,
        formattedDealPrice: String,
        formattedRetailPrice: String,
        name: String,
        score: Number,
        availableStartDates: [String],
        availableStartTimes: [String],
        formattedId: String,
        hasMoreAvailableStartTimes: Boolean,
        discount: mongoose.Schema.Types.Mixed,
      },
    ],

    ImagesJson: [
      {
        url: String,
        blurHash: String,
        keywords: [String],
        longDescription: String,
        shortDescription: String,
      },
    ],
  },
  {
    collection: "mentalhealth",
    timestamps: true,
  }
);

module.exports =
  mongoose.models.MentalHealth ||
  mongoose.model("MentalHealth", MentalHealthSchema);