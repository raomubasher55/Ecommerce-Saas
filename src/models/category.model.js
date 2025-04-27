const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.ObjectId,
    ref: "Store", 
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  subcategories: [
    {
      name: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Category", categorySchema);
