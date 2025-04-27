const Subscription = require("../models/subscription");
const ApiError = require('../utils/ApiError');

// Create or Update Plans
exports.saveSubscription = async (req, res, next) => {
  try {
    const subscription = req.body;

    // Validate subscription (similar to previous validation)
    if (!Array.isArray(subscription) || subscription.length === 0) {
      throw new ApiError("Subscription data must be a non-empty array.", 400);
    }

    for (const plan of subscription) {
      if (!plan.name || typeof plan.name !== "string") {
        throw new ApiError(`Each plan must have a valid 'name'.`, 400);
      }
      if (typeof plan.price !== "number" || plan.price < 0) {
        throw new ApiError(`Plan '${plan.name}' must have a valid positive 'price'.`, 400);
      }
      if (!plan.features || typeof plan.features !== "object") {
        throw new ApiError(`Plan '${plan.name}' must have a valid 'features' object.`, 400);
      }
      
      // Validate feature types
      for (const [featureName, featureValue] of Object.entries(plan.features)) {
        if (
          typeof featureValue !== "boolean" &&
          typeof featureValue !== "string" &&
          typeof featureValue !== "number" &&
          featureValue !== null
        ) {
          throw new ApiError(`Feature '${featureName}' in plan '${plan.name}' must be a boolean, string, number, or null.`, 400);
        }
      }
    }

    // Clear existing subscription (optional)
    await Subscription.deleteMany({});

    // Insert new subscription
    await Subscription.insertMany(subscription);

    res.status(200).json({ message: "Plans saved successfully" });
  } catch (error) {
    next(error); // Pass the error to the global error handler
  }
};

// Fetch Plans
exports.getSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.find();
    if (!subscription || subscription.length === 0) {
      throw new ApiError("No subscription plans found.", 404);
    }
    res.status(200).json(subscription);
  } catch (error) {
    next(error); // Pass the error to the global error handler
  }
};
