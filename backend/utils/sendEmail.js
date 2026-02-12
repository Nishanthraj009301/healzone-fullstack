const nodemailer = require("nodemailer");

const sendEmail = async ({ to, subject, html }) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST, // smtp.zeptomail.in
      port: Number(process.env.EMAIL_PORT), // 587
      secure: process.env.EMAIL_SECURE === "true", // false for 587
      auth: {
        user: process.env.EMAIL_USERNAME, // usually "emailapikey"
        pass: process.env.EMAIL_PASSWORD, // your long API key
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM, // noreply@heal-zone.com
      to,
      subject,
      html,
    });

    console.log("📧 Email sent successfully via ZeptoMail");
  } catch (error) {
    console.error("❌ Email sending failed:", error.message);
    throw error;
  }
};

module.exports = sendEmail;
