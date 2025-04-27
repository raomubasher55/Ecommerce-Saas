const express = require("express");
const { isAuthenticatedUser, authorizeRoles } = require("../middlewares/auth.middleware");
const { addOrUpdateReview, getProductReviews, deleteReview } = require("../controllers/review.controller");
const router = express.Router();


router.route('/:productId').get(getProductReviews);
router.route("/:productId").put(isAuthenticatedUser, addOrUpdateReview);
router.route('/:productId/:reviewId').delete(isAuthenticatedUser, authorizeRoles('admin') , deleteReview);


module.exports = router;