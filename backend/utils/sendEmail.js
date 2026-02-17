const nodemailer = require("nodemailer");

const sendEmail = async (...args) => {
  let to, subject, html;

  // Support both object style and positional style
  if (typeof args[0] === "object") {
    ({ to, subject, html } = args[0]);
  } else {
    [to, subject, html] = args;
  }

  if (!to) throw new Error("Recipient email is missing");

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: false,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const fromAddress =
    process.env.EMAIL_FROM || `"HealZone" <${process.env.EMAIL_USERNAME}>`;

  const info = await transporter.sendMail({
    from: fromAddress,
    to,
    subject,
    html,
  });

  console.log("✅ Email sent:", info.response);
};

module.exports = sendEmail;