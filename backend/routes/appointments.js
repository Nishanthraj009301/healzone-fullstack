router.post("/book", async (req, res) => {
  try {
    const appointment = new Appointment(req.body);
    await appointment.save();

    const { patientEmail, patientName } = appointment;

    // 📧 SEND TO USER'S EMAIL (NOT HARDCODED)
    try {
      await sendEmail({
        to: patientEmail,
        subject: "Appointment Confirmed | Healzone",
        html: `
          <h2>Appointment Confirmed ✅</h2>
          <p>Hi ${patientName},</p>
          <p>Your appointment has been successfully booked.</p>

          <p><b>Doctor:</b> ${appointment.doctorName}</p>
          <p><b>Date:</b> ${appointment.date}</p>
          <p><b>Time:</b> ${appointment.time}</p>

          <br />
          <p>— Healzone Team</p>
        `
      });
    } catch (mailErr) {
      console.error("Email failed:", mailErr);
    }

    res.status(201).json({
      message: "Appointment booked successfully",
      appointment
    });

  } catch (err) {
    res.status(500).json({ message: "Booking failed" });
  }
});
