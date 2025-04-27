const reviewService = require("../services/review.service");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors.middleware");

// Add or Update Review
exports.addOrUpdateReview = catchAsyncErrors(async (req, res, next) => {

  const updatedProduct = await reviewService.addOrUpdateReview(
    req.params.productId,
    req.body,
    req.user
  );
  res.status(200).json({ success: true, product: updatedProduct });
});

// Get Reviews for a Product
exports.getProductReviews = catchAsyncErrors(async (req, res, next) => {
  const reviews = await reviewService.getProductReviews(req.params.productId);
  res.status(200).json({ success: true, reviews });
});

// Delete Review
exports.deleteReview = catchAsyncErrors(async (req, res, next) => {
  await reviewService.deleteReview(
    req.params.productId,
    req.params.reviewId,
    req.user
  );
  res.status(200).json({ message : "Review delete successfully" });
});
