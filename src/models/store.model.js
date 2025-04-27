const { default: status } = require("http-status");
const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const storeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter store name"],
      unique: true,
      trim: true,
      maxlength: [50, "Store name cannot exceed 50 characters"],
    },
    ownerFullName: {
      type: String,
      required: [true, "Please enter store Owner Name"],
      trim: true,
      maxlength: [50, "Store Owner Name cannot exceed 50 characters"],
    },
    description: {
      type: String,
      required: [true, "Please enter store description"],
      maxlength: [500, "Store description cannot exceed 500 characters"],
    },
    address: {
      type: String,
      required: [true, "Please enter store address"],
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
      },
      coordinates: {
        type: [Number],
        index: "2dsphere",
      },
      formattedAddress: String,
    },
    nationality: {
      type: String,
      required: [true, "Please enter store nationality"],
    },
    phone: {
      type: String,
      required: [true, "Please enter store phone number"],
     
    },
    email: {
      type: String,
      required: [true, "Please enter store email address"],
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: [6, "Password must be at least 6 character"],
    },
    category: {
      type: mongoose.Schema.ObjectId,
    },
    products: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Product",
      },
    ],
    productsBlacklist: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Product",
      },
    ],
    orders: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Orders",
      },
    ],
    totalSales: {
      type: Number,
      default: 0,
      min: [0, 'Total sales cannot be negative'],
      get: v => Math.round(v * 100) / 100, // Ensure 2 decimal places
      set: v => Math.round(v * 100) / 100
    },
    photo: {
      public_id: {
        type: String,
      },
      url: {
        type: String,
      },
    },
    package: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Package",
        default: null, 
      },
      name: {
        type: String,
        default: null,
      },
      expiresAt: {
        type: Date,
        default: null,
      },
    },
    documents: [
      {
        personalInfo: {
          firstName: {
            type: String,
            required: true,
          },
          lastName: {
            type: String,
            required: true,
          },
          gender: {
            type: String,
            required: true,
            enum: ["male", "female", "other"],
          },
          cnic: {
            type: String,
            required: true,
          },
          DOB: {
            type: Date,
            required: true,
          },
          dateofissue: {
            type: Date,
            required: true,
          },
          dateofexpiry: {
            type: Date,
            required: true,
          },
          status: {
            type: String,
            enum: ["pending", "approved" , 'rejected'],
            default: "pending",
          },
        },
        documentType: {
          type: String,
          required: true,
          enum: ["id-card", "passport", "driving-license", "resident"],
        },
        fileType: {
          type: String,
          required: true,
        },
        filePath: [
          {
            type: String,
            required: true,
          }
        ],
        status: {
          type: String,
          enum: ["pending", "approved" , 'rejected'],
          default: "pending",
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    earnings: {
      type: Number,
      default: 0,
      min: [0, 'Earnings cannot be negative'],
      get: v => Math.round(v * 100) / 100, // Ensure 2 decimal places
      set: v => Math.round(v * 100) / 100
    },
    withdraw: [
      {
        id: String,
        amount: Number,
        status: String,
        createdAt: Date,
        updatedAt: Date,
      },
    ],
    paymentDetails: {
      holderName: String,
      cardNumber: String, 
      expiryDate: String, 
      cvc: String,
      cardType: String, 
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["active", "suspended"],
      default: "active",
    },
    suspensionReason: {
      type: String,
      default: null,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  { timestamps: true }
);

storeSchema.plugin(mongoosePaginate);

storeSchema.pre("save", function (next) {
  this.address = this.address.toLowerCase();
  next();
});

storeSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next(); // ensure we don't delay the process
  }
  this.password = await bcrypt.hash(this.password, 10);
  // if (this.isModified("cardNumber")) {
  //   this.cardNumber = encryptData(this.cardNumber);
  // }
  // if (this.isModified("cvc")) {
  //   this.cvc = encryptData(this.cvc);
  // }
  next();
});


// 🔓 Decrypt Card Number & CVC Before Sending Response
// storeSchema.methods.decryptCard = function () {
//   return {
//     holderName: this.holderName,
//     cardNumber: decryptData(this.cardNumber),
//     expiryDate: this.expiryDate,
//     cvc: decryptData(this.cvc),
//     cardType: this.cardType,
//   };
// };
storeSchema.statics.isEmailTaken = async function (email, excludeUserId) {
  const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
  return !!user;
};

storeSchema.statics.isPhoneTaken = async function (phone, excludeUserId) {
  const user = await this.findOne({ phone, _id: { $ne: excludeUserId } });
  return !!user;
};  

storeSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_TIME,
  });
};

storeSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

storeSchema.methods.getResetPasswordToken = function () {
  // Genrate Toekn
  const resetToken = crypto.randomBytes(20).toString("hex");
  // hash and set to resetPasswordToken
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  // set token expires time
  this.resetPasswordExpires = Date.now() + 30 * 60 * 1000;
  return resetToken;
};

module.exports = mongoose.model("Store", storeSchema);
