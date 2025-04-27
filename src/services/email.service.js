const sendEmail = require('../utils/sendEmail');

/**
 * Send verification email
 * @param {string} email - Recipient's email address
 * @param {string} token - Verification token
 * @returns {Promise<void>}
 */
const sendVerificationEmail = async (email, token) => {
//   const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  const verificationLink = `${process.env.FRONTEND_URL}/verify-email/${token}`;

  const subject = 'Verify Your Email';
  const message = `Please verify your email address using this link: ${verificationLink} `;
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4; border-radius: 5px; max-width: 600px; margin: auto;">
        <h2 style="color: #333; text-align: center;">Welcome to Our Platform!</h2>
        <p style="color: #555; font-size: 16px;">Hello,</p>
        <p style="color: #555; font-size: 16px;">Please verify your email by clicking the link below:</p>  
        <div style="text-align: center;">
            <a href="${verificationLink}" style="display: inline-block; padding: 15px 30px; margin: 20px 0; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px; font-size: 18px;">Verify Email</a>
        </div>
        <p style="color: #555; font-size: 16px;">If you did not create an account, no further action is required. Your account will remain inactive until you verify your email.</p>
        <p style="color: #555; font-size: 16px;">If you have any questions, feel free to reach out to our support team.</p>
        <p style="color: #555; font-size: 16px;">Best regards,<br>Cebleu</p>
        <footer style="margin-top: 20px; text-align: center; color: #aaa; font-size: 14px;">
            <p>© ${new Date().getFullYear()} Cebleu. All rights reserved.</p>
        </footer>
    </div>
  `;

  await sendEmail({ email, subject, message, html });
};


/**
 * Send password reset email
 * @param {string} email - Recipient's email address
 * @param {string} token - Password reset token
 * @returns {Promise<void>}
 */
const sendPasswordResetEmail = async (email, token , host , protocol) => {
    // const resetUrl = `${protocol}://${host}/api/v1/password/reset/${token}`;
    const resetUrl = `${process.env.FRONTEND_URL}/api/v1/password/reset/${token}`;
    const message = `Your password reset token is as follows:\n\n${resetUrl}\n\nIf you have not requested this email, please ignore it.`;
  
    const subject = 'Reset Your Password';
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4; border-radius: 5px; max-width: 600px; margin: auto;">
        <h1 style="color: #333; text-align: center;">Password Reset Request</h1>
        <p style="color: #555; font-size: 16px;">Hello,</p>
        <p style="color: #555; font-size: 16px;">We received a request to reset your password. If you did not make this request, please ignore this email.</p>
        <p style="color: #555; font-size: 16px;">To reset your password, please click the link below:</p>
        <div style="text-align: center;">
          <a href="${resetUrl}" style="display: inline-block; padding: 15px 30px; margin: 20px 0; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px; font-size: 18px;">Reset Password</a>
        </div>
        <p style="color: #555; font-size: 16px;">If you have any questions or need further assistance, feel free to reach out to our support team.</p>
        <p style="color: #555; font-size: 16px;">Best regards,<br>Cebleu</p>
      </div>
    `;
  
    await sendEmail({ email, subject, message, html });
  };

/**
 * Send welcome email
 * @param {string} email - Recipient's email address
 * @param {string} name - User's name
 * @returns {Promise<void>}
 */
const sendWelcomeEmail = async (email, name) => {
  const subject = 'Welcome to Our Platform!';
  const message = `Welcome ${name}! We're excited to have you on board.`;
  const html = `
    <h1 style="color: #4CAF50; text-align: center;">Welcome to Our Platform, ${name}!</h1>
    <p style="font-size: 16px; line-height: 1.5; color: #555; text-align: center;">We're thrilled to have you here. Feel free to explore and enjoy our services. Our platform offers a variety of features designed to enhance your experience.</p>
    <p style="font-size: 16px; line-height: 1.5; color: #555; text-align: center;">If you have any questions or need assistance, don't hesitate to reach out to our support team. We're here to help!</p>
    <div style="text-align: center; margin-top: 20px;">
        <a href="${process.env.FRONTEND_URL}" style="display: inline-block; padding: 10px 20px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px; font-size: 16px;">Get Started</a>
    </div>
  `;

  await sendEmail({ email, subject, message, html });
};

/**
 * Send promotional email
 * @param {string} email - Recipient's email address
 * @param {string} promotion - Details about the promotion
 * @returns {Promise<void>}
 */
const sendPromotionalEmail = async (email, promotion) => {
  const subject = 'Exciting Promotion Just for You!';
  const message = `Check out this amazing offer: ${promotion}`;
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9; border-radius: 5px; max-width: 600px; margin: auto; border: 1px solid #ddd;">
        <h1 style="color: #4CAF50; text-align: center;">Don't Miss Out!</h1>
        <p style="font-size: 16px; line-height: 1.5; color: #555;">We have an exciting promotion just for you! 🎉</p>
        <p style="font-size: 16px; line-height: 1.5; color: #555;">${promotion}</p>
        <p style="font-size: 16px; line-height: 1.5; color: #555;">This is a limited-time offer, so make sure to take advantage of it before it's gone!</p>
        <p style="font-size: 16px; line-height: 1.5; color: #555;">If you have any questions or need assistance, feel free to reach out to our support team. We're here to help!</p>
        <div style="text-align: center; margin-top: 20px;">
            <a href="${process.env.FRONTEND_URL}/promotions" style="display: inline-block; padding: 15px 30px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px; font-size: 18px;">View Promotion</a>
        </div>
    </div>
  `;

  await sendEmail({ email, subject, message, html });
};

/**
 * Send account suspension email
 * @param {string} email - Recipient's email address
 * @param {string} reason - Reason for account suspension
 * @returns {Promise<void>}
 */
const sendAccountSuspensionEmail = async (email, reason) => {
  const subject = 'Your Account Has Been Suspended';
  const message = `Your account has been suspended for the following reason: ${reason}`;
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f8d7da; border: 1px solid #f5c6cb; border-radius: 5px; max-width: 600px; margin: auto; text-align: center;">
        <h1 style="color: #721c24;">Account Suspension Notice</h1>
        <p style="font-size: 16px; line-height: 1.5; color: #721c24;">We regret to inform you that your account has been suspended due to the following reason:</p>
        <p style="font-size: 18px; font-weight: bold; color: #721c24;">${reason}</p>
        <p style="font-size: 16px; line-height: 1.5; color: #721c24;">If you believe this is a mistake or if you have any questions, please do not hesitate to reach out to our support team. We are here to assist you and resolve any issues you may have.</p>
        <div style="margin-top: 20px;">
            <a href="${process.env.FRONTEND_URL}/support" style="display: inline-block; padding: 10px 20px; background-color: #dc3545; color: white; text-decoration: none; border-radius: 5px; font-size: 16px;">Contact Support</a>
        </div>
    </div>
  `;

  await sendEmail({ email, subject, message, html });
};

/**
 * Send password change confirmation email
 * @param {string} email - Recipient's email address
 * @returns {Promise<void>}
 */
const sendPasswordChangeConfirmationEmail = async (email) => {
  const subject = 'Password Changed Successfully';
  const message = `Your password has been changed successfully. If you did not initiate this change, contact support immediately.`;
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4; border-radius: 5px; max-width: 600px; margin: auto; border: 1px solid #ddd;">
        <h1 style="color: #4CAF50; text-align: center;">Password Changed Successfully</h1>
        <p style="font-size: 16px; line-height: 1.5; color: #555;">Dear User,</p>
        <p style="font-size: 16px; line-height: 1.5; color: #555;">We wanted to inform you that your password has been updated successfully. Your account security is our top priority, and we encourage you to keep your password confidential.</p>
        <p style="font-size: 16px; line-height: 1.5; color: #555;">If you did not initiate this change, please contact our support team immediately to secure your account. We are here to assist you with any concerns you may have.</p>
        <p style="font-size: 16px; line-height: 1.5; color: #555;">Thank you for being a valued member of our community!</p>
        <p style="font-size: 16px; line-height: 1.5; color: #555;">Best regards,<br>Cebleu</p>
    </div>
  `;

  await sendEmail({ email, subject, message, html });
};

/**
 * Send payment confirmation email
 * @param {string} email - Recipient's email address
 * @param {string} transactionId - Transaction ID
 * @param {string} amount - Payment amount
 * @returns {Promise<void>}
 */
const sendPaymentConfirmationEmail = async (email, transactionId, amount) => {
  const subject = 'Payment Confirmation';
  const message = `Your payment of ${amount} has been successfully processed. Transaction ID: ${transactionId}`;
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #e7f3fe; border: 1px solid #b3d7ff; border-radius: 5px; max-width: 600px; margin: auto; text-align: center;">
        <h1 style="color: #007bff;">Payment Confirmed</h1>
        <p style="font-size: 18px; line-height: 1.5; color: #333;">Dear Valued Customer,</p>
        <p style="font-size: 16px; line-height: 1.5; color: #333;">We are pleased to inform you that your payment of <strong style="color: #28a745;">${amount}</strong> has been processed successfully.</p>
        <p style="font-size: 16px; line-height: 1.5; color: #333;">Your transaction ID is: <strong style="color: #28a745;">${transactionId}</strong></p>
        <p style="font-size: 16px; line-height: 1.5; color: #333;">Thank you for your prompt payment! If you have any questions or need further assistance, please do not hesitate to reach out to our support team.</p>
        <p style="font-size: 16px; line-height: 1.5; color: #333;">Best regards,<br>Cebleu</p>
    </div>
  `;

  await sendEmail({ email, subject, message, html });
};

/**
 * Send account deletion email
 * @param {string} email - Recipient's email address
 * @param {string} name - User's name
 * @returns {Promise<void>}
 */
const sendAccountDeletionEmail = async (email, name) => {
  const subject = 'Account Deletion Confirmation';
  const message = `Dear ${name}, your account has been deleted successfully.`;
  const html = `
    <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; border: 1px solid #ccc; border-radius: 5px; background-color: #f9f9f9; max-width: 600px; margin: auto;">
      <h1 style="color: #e74c3c; text-align: center;">Account Deletion Confirmation</h1>
      <p style="font-size: 16px;">Dear ${name},</p>
      <p style="font-size: 16px; line-height: 1.5;">We regret to inform you that your account has been deleted successfully. While we are sad to see you go, we respect your decision and appreciate the time you spent with us.</p>
      <p style="font-size: 16px; line-height: 1.5;">If you have any feedback or suggestions on how we can improve our services, we would love to hear from you. Your insights are invaluable to us.</p>
      <p style="font-size: 16px; line-height: 1.5;">Should you have any questions or require further assistance, please do not hesitate to reach out to our support team. We are here to help!</p>
      <p style="font-size: 16px; line-height: 1.5;">Thank you for being a part of our community. We wish you all the best in your future endeavors!</p>
      <p style="font-size: 16px; line-height: 1.5;">Best regards,<br>Cebleu</p>
    </div>
  `;

  await sendEmail({ email, subject, message, html });
};


/**
 * Send reminder email
 * @param {string} email - Recipient's email address
 * @returns {Promise<void>}
 */
const sendReminderEmail = async (email) => {
  const subject = 'Alert: Your Payment is not completed';
  const message = 'Dear Customer, we noticed that your payment is still pending. Please complete your payment to avoid any interruptions in service.';
  const html = `
    <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; border: 1px solid #ccc; border-radius: 5px; background-color: #f9f9f9; max-width: 600px; margin: auto;">
      <h1 style="color: #3498db; text-align: center;">Payment Reminder</h1>
      <p style="font-size: 16px; line-height: 1.5;">Dear Valued Customer,</p>
      <p style="font-size: 16px; line-height: 1.5;">We hope this message finds you well. We wanted to remind you that your payment is still pending. To ensure uninterrupted access to our services, we kindly ask you to complete your payment at your earliest convenience.</p>
      <p style="font-size: 16px; line-height: 1.5;">If you have already made the payment, please disregard this message. Otherwise, you can complete your payment by clicking the link below:</p>
      <p style="text-align: center;">
        <a href="${process.env.PAYMENT_LINK}" style="display: inline-block; padding: 10px 20px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px; font-size: 16px;">Complete Payment</a>
      </p>
      <p style="font-size: 16px; line-height: 1.5;">Thank you for your attention to this matter. If you have any questions or need assistance, please do not hesitate to reach out to our support team.</p>
      <p style="font-size: 16px; line-height: 1.5;">Best regards,<br>Cebleu</p>
    </div>
  `;

  await sendEmail({ email, subject, message, html });
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendPromotionalEmail,
  sendAccountSuspensionEmail,
  sendPasswordChangeConfirmationEmail,
  sendPaymentConfirmationEmail,
  sendAccountDeletionEmail,
  sendReminderEmail,
};
