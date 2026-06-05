const nodemailer = require("nodemailer");

const sendEmail = async ({ to, subject, text, html }) => {
  try {
    // 1. Create the transporter securely
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // 2. Define the email options
    const mailOptions = {
      from: '"Project Oju" <no-reply@projectoju.com>', // Sender display name
      to,
      subject,
      text, // Plain text fallback
      html, // Formatted HTML design (Optional but recommended)
    };

    // 3. Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log(
      `✉️ Email sent successfully to ${to} (Message ID: ${info.messageId})`,
    );

    return true;
  } catch (error) {
    console.error(`❌ Error sending email to ${to}:`, error.message);
    // You might want to throw the error here depending on if you want
    // the main registration flow to fail when an email fails to send.
    throw new Error("Email could not be sent.");
  }
};

module.exports = sendEmail;
