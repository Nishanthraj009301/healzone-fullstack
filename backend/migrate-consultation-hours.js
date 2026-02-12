const mongoose = require("mongoose");
const Doctor = require("./models/Doctor");
require("dotenv").config();

async function migrateConsultationHours() {
  try {
    // 1️⃣ Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected for migration");

    // 2️⃣ Fetch all doctor documents
    const doctors = await Doctor.find();
    let updatedCount = 0;

    for (const doc of doctors) {
      const hours = [];

      // 3️⃣ Read Excel-style fields from raw document
      Object.keys(doc._doc).forEach((key) => {
        if (key.startsWith("consultation_hours[")) {
          const h = doc[key];

          if (
            h &&
            typeof h === "object" &&
            h.day &&
            h.from &&
            h.to &&
            h.from !== "" &&
            h.to !== ""
          ) {
            hours.push({
              day: h.day,
              from: h.from,
              to: h.to
            });
          }
        }
      });

      // 4️⃣ Save normalized array if found
      if (hours.length > 0) {
        doc.consultation_hours = hours;
        await doc.save();
        updatedCount++;
      }
    }

    console.log(
      `✅ Migration completed successfully. Updated ${updatedCount} documents.`
    );

    process.exit(0);
  } catch (err) {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  }
}

migrateConsultationHours();
