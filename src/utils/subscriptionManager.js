const cron = require("node-cron");
const User = require("../models/user");
const sendEmail = require("../utils/sendEmail");

// Schedule a job to run daily
cron.schedule("0 0 * * *", async () => {
  try {
    console.log("Running subscription check...");

    // Find users with packages expiring in 2 days
    const usersWithExpiringPackages = await User.find({
      "package.expiresAt": {
        $lte: new Date(new Date().setDate(new Date().getDate() + 2)),
        $gt: new Date(),
      },
    });

    for (const user of usersWithExpiringPackages) {
      await sendEmail({
        email: user.email,
        subject: "Your Subscription is Expiring Soon!",
        message: `Dear ${user.name},\n\nYour subscription for the ${user.package.name} package will expire in 2 days. Please renew it to continue enjoying our services.\n\nThank you!`,
      });
    }

    console.log("Subscription notifications sent.");
  } catch (error) {
    console.error("Error during subscription notifications:", error.message);
  }
});
