const sendEmail = require("./sendEmail");

const sendOTPEmail = async (email, otp) => {

  const html = `
  
  <div style="font-family:Arial;padding:20px">

    <h2 style="color:#2563eb">HealZone Vendor Verification</h2>

    <p>Your verification code is:</p>

    <h1 style="
      letter-spacing:6px;
      background:#f1f5f9;
      padding:12px;
      display:inline-block;
      border-radius:6px
    ">
      ${otp}
    </h1>

    <p>This OTP will expire in <b>5 minutes</b>.</p>

    <p>If you did not request this, please ignore this email.</p>

  </div>
  `;

  await sendEmail({
    to: email,
    subject: "HealZone Vendor OTP Verification",
    html,
  });

};

module.exports = sendOTPEmail;