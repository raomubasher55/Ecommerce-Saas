const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const mongoosePaginate = require("mongoose-paginate-v2");

dotenv.config({ path: "./config.env" });

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your name "],
    maxlength: [30, "your name cannot exceed 30 chahrcters"],
  },
  email: {
    type: String,
    required: [true, "Please enter your email "],
    unique: true,
    validate: [validator.isEmail, "please enter valid email address"],
  },
  mobile:{
    type:String,
    required:[true,"Please enter your mobile number"],
    unique:true,
  },
  password: {
    type: String,
    required: [true, "Please enter your password "],
    minlength: [6, "your password must be longer than 6 chahrcters"],
    select: false,
  },
  avatar: {
    public_id: {
      type: String,
      // required: true,
    },
    url: {
      type: String,
      // required: true,
    },
  },
  role: {
    type: String,
    enum: ["user", "admin", "superadmin"],
    default: "user",
  },
  reviews: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
 
  orders: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Orders",
    },
  ],
  isVerified: {
    type: Boolean,
    default: false,
  },
  verifyToken: String,
  verifyTokenExpires: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
});

userSchema.plugin(mongoosePaginate);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

/**
 * Check if email is taken
 * @param {string} email - The user's email
 * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
userSchema.statics.isEmailTaken = async function (email, excludeUserId) {
  const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
  return !!user;
};

userSchema.statics.isMobileTaken = async function (mobile, excludeUserId) {
  const user = await this.findOne({ mobile, _id: { $ne: excludeUserId } });
  return !!user;
};

userSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_TIME,
  });
};

userSchema.methods.comparePassword = async function (enetredPassword) {
  return await bcrypt.compare(enetredPassword, this.password);
};

// genrate password reset token
userSchema.methods.getResetPasswordToken = function () {
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

// genrate verify token
userSchema.methods.getVerifyToken = function () {
  const verifyToken = crypto.randomBytes(20).toString("hex");
  this.verifyToken = crypto.createHash("sha256").update(verifyToken).digest("hex");
  this.verifyTokenExpires = Date.now() + 30 * 60 * 1000;
  return verifyToken;
};

module.exports = mongoose.model("User", userSchema);
