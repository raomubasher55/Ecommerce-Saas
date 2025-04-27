const mongoose = require("mongoose");

const orderSchema = mongoose.Schema({
  user: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: "User", // Refers to the User model
  },
  store:{
    type: mongoose.Types.ObjectId,
    required:true,
    ref:"Store"
  },
  shippingInfo: {
    address: {
      type: String,
      required: true, // Single address string
    },
    city: {
      type: String,
      required: true,
    },
    phoneNo: {
      type: String,
      required: true,
    },
    postalCode: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
  },
  orderItems: [
    {
      name: {
        type: String,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      image: {
        type: String,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      product: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "Product", // Refers to the Product model
      },
    },
  ],
  paymentInfo: {
    id: {
      type: String,
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'], 
      default: 'pending', 
    },
    method: { 
      type: String,
      enum: ['COD', 'Online'],
      default: 'COD',
    },
  },
  itemsPrice: {
    type: Number,
    required: true,
    default: 0.0,
  },
  paidAt: {
    type: Date,
  },
  shippingPrice: {
    type: Number,
    required: true,
    default: 0.0,
  },
  taxPrice: {
    type: Number,
    required: true,
    default: 0.0,
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0.0,
  },
  orderStatus: {
    type: String,
    required: true,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: "pending",
  },
  trackingDetails: {
    status:{
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: "pending",
    },
    updatedAt:{
      type:Date,
    },
    courier: {
      type: String,
      default: '',
    },
    trackingNumber: {
      type: String,
      default: '',
    },
    estimatedDelivery: {
      type: Date,
      default: null,
    },
  },
  deliveredAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Ensure the `product` field is converted to ObjectId if it is a string
orderSchema.pre('validate', function (next) {
  this.orderItems.forEach((item) => {
    if (typeof item.product === 'string') {
      item.product = mongoose.Types.ObjectId(item.product);
    }
  });
  next();
});

// Pre-save hook to add tracking details when the order status changes
orderSchema.pre("save", function (next) {
  if (this.isModified("orderStatus")) {
    // Update the trackingDetails object with the new status and timestamp
    this.trackingDetails = {
      status: this.orderStatus,   // Current order status
      updatedAt: Date.now(),      // Timestamp of the update
    };
  }
  next();
});

module.exports = mongoose.model("Order", orderSchema);
