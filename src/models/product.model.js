const mongoose = require("mongoose");
const Store = require("./store.model");
const Package = require('./Package.model')

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter product name"],
    trim: true,
    maxLength: [100, "Product name cannot exceed 100 characters"],
  },
  price: {
    type: Number,
    required: [true, "Please enter product price"],
    default: 0.0,
  }, 
  discountedPrice: {
    type: Number,
    default: null,
  },
  discountPercentage: {
    type: Number,
    default: null,
    validate: {
      validator: function (value) {
        return value >= 0 && value <= 100; // Discount percentage must be between 0 and 100
      },
      message: 'Discount percentage must be between 0 and 100',
    },
  },
  discountStartDate: {
    type: Date,
    // required: true,
  },
  discountEndDate: {
    type: Date,
    // required: true,
  },
  description: {
    type: String,
    required: [true, "Please enter product description"],
  },
  ratings: {
    type: Number,
    default: 0,
  },
  images: [
    {
      public_id: {
        type: String,
        // required: true,
      },
      url: {
        type: String,
        // required: true,
      },
      fileType: {  // Add the fileType field here
        type: String,
        required: true,
      },
    },
  ],
  category: {
    type: mongoose.Schema.ObjectId,
    ref: 'Category',
    required: true,
  },
  subcategory: {
    type: mongoose.Schema.ObjectId,
    ref: 'Subcategory', // Reference to the Subcategory model
    required: true,
  },
  seller: {
    type: mongoose.Schema.ObjectId,
    ref: "Store",
    required: [true, "Please enter product seller"],
  },
  stock: {
    type: String,
    required: [true, "Please enter product stock"],
    maxLength: [5, "Product stock cannot exceed 5 characters"],
    default: 0,
  },
  numOfReviews: {
    type: Number,
    default: 0,
  },
  // reviews: [
  //   {
  //     user: {
  //       type: mongoose.Schema.ObjectId,
  //       ref: "User", // Reference to User model
  //       required: true,
  //     },
  //     rating: {
  //       type: Number,
  //       required: true,
  //     },
  //     comment: {
  //       type: String,
  //       required: true,
  //     },
  //   },
  // ],
  reviews: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Review", // Reference to the Review model
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Middleware to calculate discounted price before saving the product
productSchema.pre('save', function (next) {
  if (this.discountPercentage > 0 && this.discountStartDate && this.discountEndDate) {
    const currentDate = new Date();
    if (currentDate >= this.discountStartDate && currentDate <= this.discountEndDate) {
      this.discountedPrice = this.price - (this.price * (this.discountPercentage / 100));
    } else {
      this.discountedPrice = this.price;  // Keep the original price when the discount is inactive
    }
  } else {
    this.discountedPrice = this.price;  // Keep the original price when there's no discount
  }
  next();
});



// Helper method to check if the discount is active
productSchema.methods.isDiscountActive = function () {
  const currentDate = new Date();
  return currentDate >= this.discountStartDate && currentDate <= this.discountEndDate;
};


// Middleware to filter products based on active store packages
// In product.model.js
productSchema.pre(/^find/, async function (next) {
  // 1. Find all ACTIVE Packages
  const activePackages = await Package.find({ isActive: true }).select('_id');
  const activePackageIds = activePackages.map(pkg => pkg._id);

  // 2. Find Stores that:
  //    - Are ACTIVE (status: 'active')
  //    - Reference an ACTIVE Package (package.id is in activePackageIds)
  const activeStores = await Store.find({
    status: 'active',
    'package.id': { $in: activePackageIds }
  }).select('_id');

  // console.log("Active Stores:", activeStores); // Debug

  // 3. Filter products by these valid Stores
  const activeStoreIds = activeStores.map(store => store._id);
  this.where({ seller: { $in: activeStoreIds } });
  next();
});

productSchema.pre('aggregate', async function (next) {
  this.pipeline().unshift({
    $lookup: {
      from: "stores",
      localField: "seller",
      foreignField: "_id",
      as: "store",
    },
  }, {
    $unwind: "$store"
  }, {
    $match: {
      $or: [
        { "store.package.expiresAt": { $gt: new Date() } },
        { "store.package.expiresAt": null }
      ]
    }
  });

  next();
});


productSchema.index({ name: 'text' });
productSchema.index({ price: 1 });
productSchema.index({ category: 1 });
productSchema.index({ ratings: 1 });
productSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Product", productSchema);
