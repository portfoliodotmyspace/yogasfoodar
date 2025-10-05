const nodemailer = require("nodemailer");
const logger = require("./logger");

// Create transporter using your SMTP credentials (Gmail example)
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: process.env.EMAIL_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER, // your email
    pass: process.env.EMAIL_PASS, // your email password or app password
  },
});

const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const info = await transporter.sendMail({
      from: `"Yoga Food" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });
    logger.info("Email sent: %s", info.messageId);
    return info;
  } catch (err) {
    logger.error("Email sending error: %s", err.message);
    throw new Error("Failed to send email");
  }
};

module.exports = sendEmail;
