const nodemailer = require("nodemailer");

const sendEmail = async (...args) => {
  let to, subject, html;

  // Support both object style and positional style
  if (typeof args[0] === "object") {
    ({ to, subject, html } = args[0]);
  } else {
    [to, subject, html] = args;
  }

  if (!to) {
    throw new Error("Recipient email is missing");
  }

  console.log("📡 SMTP CONFIG CHECK:", {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    user: process.env.EMAIL_USERNAME,
    from: process.env.EMAIL_FROM,
  });

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: false, // true only if using 465
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 10000,
    socketTimeout: 10000,
    tls: {
      rejectUnauthorized: false,
    },
    family: 4, // 🔥 FORCE IPv4 (fixes many Render SMTP issues)
  });

  try {
    // Verify connection before sending
    await transporter.verify();
    console.log("✅ SMTP connection verified");

    const info = await transporter.sendMail({
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
    console.error("❌ SMTP ERROR:", error);
    throw error;
  }
};

module.exports = sendEmail;