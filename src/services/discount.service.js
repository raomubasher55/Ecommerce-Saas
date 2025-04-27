const ApiError = require("../utils/ApiError");
const Product = require("../models/product.model");
const { DateTime } = require('luxon');


exports.updateProductDiscount = async (productId, discountPercentage, discountStartDate, discountEndDate) => {
  // Convert to UTC if input is in local time
  const discountStartUTC = DateTime.fromISO(discountStartDate).toUTC().toISO();
  const discountEndUTC = DateTime.fromISO(discountEndDate).toUTC().toISO();

  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError("Product not found", 404);
  }

  // Update discount information
  product.discountPercentage = discountPercentage;
  product.discountStartDate = discountStartUTC;
  product.discountEndDate = discountEndUTC;

  await product.save({validateBeforeSave: false});
  return product;
};
exports.removeProductDiscount = async (productId) => {
  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError("Product not found", 404);
  }

  // Remove discount by setting discount percentage to 0
  product.discountPercentage = 0;
  product.discountedPrice = product.price; // Revert back to the original price

  await product.save({validateBeforeSave: false});
  return product;
};
