const nodemailer = require("nodemailer");

// Function to send email using environment variables
const sendEmail = async (options) => {
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // Use true for 465, false for other ports
    requireTLS: true,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const message = {
    from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    // Optional: Add HTML content if needed
    html: options.html || null,
  };

  // Send the email
  await transport.sendMail(message);
};

module.exports = sendEmail;
