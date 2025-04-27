const mongoose = require("mongoose");

const PlanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number, // price is a number, not a string
      required: true,
    },
    features: {
      productLimit: {
        type: Number,
        required: true,
      },
      support: {
        type: String,
        required: true,
      },
      analytics: {
        type: String,
        required: true,
      },
      paymentGateways: {
        type: String,
        required: true,
      },
      marketingTools: {
        type: Boolean,
        required: true,
      },
      globalReach: {
        type: Boolean,
        required: true,
      },
      referralProgram: {
        type: Boolean,
        required: true,
      },
      transactionLimits: {
        type: String,
        required: true,
      },
    },
  },
  { timestamps: true }
);

const Subscription = mongoose.model("Subscription", PlanSchema);

module.exports = Subscription;
