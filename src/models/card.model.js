const mongoose = require("mongoose");
const { encryptData, decryptData } = require("../utils/encryptionCard");

const CardSchema = new mongoose.Schema({
  storeId: {
    type: mongoose.Schema.ObjectId,
    ref: "Store",
    required: true,
  },
  holderName: { type: String, required: true },
  cardNumber: { type: String, required: true },
  expiryDate: { type: String, required: true },
  cvc: { type: String, required: true },
  cardType: { type: String, required: true },
});

// 🔐 Encrypt Card Number & CVC Before Saving
CardSchema.pre("save", function (next) {
  if (this.isModified("cardNumber")) {
    this.cardNumber = encryptData(this.cardNumber);
  }
  if (this.isModified("cvc")) {
    this.cvc = encryptData(this.cvc);
  }
  next();
});

// 🔓 Decrypt Card Number & CVC Before Sending Response
CardSchema.methods.decryptCard = function () {
  return {
    _id: this._id,
    storeId: this.storeId,
    holderName: this.holderName,
    cardNumber: decryptData(this.cardNumber),
    expiryDate: this.expiryDate,
    cvc: decryptData(this.cvc),
    cardType: this.cardType,
  };
};

const Card = mongoose.model("Card", CardSchema);
module.exports = Card;
