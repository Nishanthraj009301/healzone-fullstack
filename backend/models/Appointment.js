const appointmentSchema = new mongoose.Schema({
  patientName: { type: String, required: true },
  patientEmail: { type: String, required: true },

  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true
  },

  doctorName: String,
  specialization: String,
  hospital: String,

  date: String,
  time: String
}, { timestamps: true });
