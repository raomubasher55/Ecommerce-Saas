const mongoose = require("mongoose");

const adSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please enter ad title"],
  },
  description: {
    type: String,
    required: [true, "Please enter ad description"],
  },
  product: {
    type: mongoose.Schema.ObjectId,
    ref: "Product",
    required: [true, "Please provide the product for this ad"],
  },
  startDate: {
    type: Date,
    required: [true, "Please provide ad start date"],
  },
  endDate: {
    type: Date,
    required: [true, "Please provide ad end date"],
    index: { expires: 0 }
  },
  image: {
    type: String,
  },
  isConfirmed: {
    type: Boolean,
    default: false,
  },
  price: {
    type: Number,
    default: 0,
  },
  store: {
    type: mongoose.Schema.ObjectId,
    ref: "Store",
    required: [true, "Please provide the store for this ad"],
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "inactive", 
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Middleware to automatically update ad status before saving
// adSchema.pre("save", function (next) {
//   const currentDate = new Date();
//   if (currentDate >= this.startDate && currentDate <= this.endDate) {
//     this.status = "active";
//   } else {
//     this.status = "inactive";
//   }
//   next();
// });

module.exports = mongoose.model("Ad", adSchema);
