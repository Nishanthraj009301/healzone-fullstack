const nodemailer = require("nodemailer");

let transporter;

function getTransporter() {
  if (!transporter) {
    console.log("🚀 Creating SMTP transporter...");

    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: false,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
      pool: true,               // 🔥 enable pooling
      maxConnections: 5,
      maxMessages: 100,
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 15000,
      family: 4                 // force IPv4
    });
  }

  return transporter;
}

const sendEmail = async ({ to, subject, html }) => {
  if (!to) throw new Error("Recipient email missing");

  const smtp = getTransporter();

  try {
    const info = await smtp.sendMail({
      from:
        process.env.EMAIL_FROM ||
        `"HealZone" <${process.env.EMAIL_USERNAME}>`,
      to,
      subject,
      html,
    });

    console.log("✅ Email sent:", info.response);
    return info;
  } catch (error) {
    console.error("❌ SMTP ERROR:", error.message);
    throw error;
  }
};

module.exports = sendEmail;