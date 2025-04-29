const mongoose = require("mongoose");

const packageSchema = new mongoose.Schema(
  {
    seller:{
      type:mongoose.Schema.ObjectId,
      ref:'Store',
      required:true
    },
    name: {
      type: String,
      required: true,
      enum: ["Starter", "Classic", "Growth", "Enterprise"], 
    },
    price: {
      type: Number,
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
        enum: ["Basic Email Support", "Priority Email Support", "24/7 Support", "Dedicated Account Manager"],
      },
      analytics: {
        type: String,
        required: true,
        enum: ["Basic Analytics", "Advanced Analytics", "Full Analytics Suite", "Custom Analytics and Reporting"],
      },
      paymentGateways: {
        type: String,
        required: true,
        enum: ["Standard Gateways", "Standard + Premium Gateways", "All Gateways + Custom Integrations"],
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
    isActive:{
      type:Boolean,
      default: false
    },
  },
  { timestamps: true }
);

const Package = mongoose.model("Package", packageSchema);
module.exports = Package;
