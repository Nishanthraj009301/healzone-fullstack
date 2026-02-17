const axios = require("axios");

const sendEmail = async ({ to, subject, html }) => {
  if (!to) throw new Error("Recipient email missing");

  try {
    const response = await axios.post(
      "https://api.zeptomail.in/v1.1/email",
      {
        from: {
          address: process.env.EMAIL_FROM,
          name: "HealZone",
        },
        to: [
          {
            email_address: {
              address: to,
            },
          },
        ],
        subject: subject,
        htmlbody: html,
      },
      {
        headers: {
  accept: "application/json",
  "content-type": "application/json",
  Authorization: `Zoho-enczapikey ${process.env.EMAIL_PASSWORD}`,
},
        timeout: 10000,
      }
    );

    console.log("✅ Email sent via ZeptoMail API");
    return response.data;

  } catch (error) {
    console.error(
      "❌ ZeptoMail API Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

module.exports = sendEmail; 