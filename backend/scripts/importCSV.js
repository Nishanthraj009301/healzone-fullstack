const fs = require("fs");
const csv = require("csv-parser");
const mongoose = require("mongoose");
const Doctor = require("../models/Doctor");
require("dotenv").config();

async function importCSV() {
  try {
    // 1️⃣ Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    const doctors = [];

    // 2️⃣ Read CSV file
    fs.createReadStream("./scripts/practo.csv") // ⚠️ filename must match
      .pipe(csv())
      .on("data", (row) => {
        /**
         * Optional light cleanup for known numeric fields
         * (Safe – does NOT remove any columns)
         */
        if (row.Rokka && !isNaN(row.Rokka)) {
          row.Rokka = Number(row.Rokka);
        }

        if (
          row["reviews.overall_rating"] &&
          !isNaN(row["reviews.overall_rating"])
        ) {
          row["reviews.overall_rating"] = Number(
            row["reviews.overall_rating"]
          );
        }

        // 🔥 PUSH ENTIRE ROW (ALL COLUMNS)
        doctors.push(row);
      })
      .on("end", async () => {
        try {
          if (doctors.length === 0) {
            console.log("No records found in CSV ❌");
            process.exit(0);
          }

          await Doctor.insertMany(doctors, { ordered: false });

          console.log(
            `CSV import completed ✅ (${doctors.length} records)`
          );
          process.exit(0);
        } catch (err) {
          console.error("MongoDB insert error ❌", err);
          process.exit(1);
        }
      })
      .on("error", (err) => {
        console.error("CSV read error ❌", err);
        process.exit(1);
      });

  } catch (err) {
    console.error("MongoDB connection failed ❌", err);
    process.exit(1);
  }
}

importCSV();
