const express = require("express");
const router = express.Router();

const {
  getProducts,
  newProduct,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  // createProductReview,
  // getProductReviews,
  // deleteReview,
  // updateProductDiscount,
  // removeProductDiscount,
  bulkUploadProducts,
  fetchStoreProducts,
  ProductsByStore,
  fetchStoreProductsById,
  getProductsByCategory,
  getProductSuggestions,
} = require("../controllers/product.controller");
const { isAuthenticatedUser, authorizeRoles, isAuthenticatedStore, authorizeRolesAndStoreAccess, isAuthenticatedStoreOrUser } = require("../middlewares/auth.middleware");
const { csvUpload, imageUpload } = require("../middlewares/multer.middleware");


// http://localhost:4000/api/v1/products?keyword=12
// http://localhost:4000/api/v1/products?keyword=apple&category=electronics&price[gte]=200&price[lte]=500
// http://localhost:4000/api/v1/products?price[gte]=20&price[lte]=100&ratings[gte]=4
// /api/v1/products?page=2&limit=5
// /api/v1/products?keyword=memory&price[gte]=20&page=2&limit=5
// gt, gte, lt, lte
// you can generate more query from chatGPT 

// use can also use this rotue for searching and filtering

router.route("/products").get(getProducts); //done
router.route("/products/bystore").get(ProductsByStore); //done
router.route('/store/products').get( isAuthenticatedStore , fetchStoreProducts) //done
router.route("/product/:id").get(getSingleProduct); //done 
router.route('/store/:storeId/products').get(fetchStoreProductsById);
router.route("/products/category/:categoryName").get(getProductsByCategory);

// bulk product
router.route('/product/bulk-upload').post(isAuthenticatedUser , authorizeRoles('admin') , csvUpload.single('file')  , bulkUploadProducts )
router.route("/product/new").post(isAuthenticatedStore , imageUpload.array('images', 5) , newProduct); //done
router.route("/admin/product/:id").put(isAuthenticatedStore ,imageUpload.array('images' , 5) , updateProduct); //done but s sy images ka issue aa raha hai
router
  .route("/admin/product/:id")
  .delete(
    // authorizeRolesAndStoreAccess("admin", "storeowner"),
    // isAuthenticatedStoreOrUser,
    deleteProduct
); 


// // Discount Products
// router.route("/admin/product/discount/:productId").put(isAuthenticatedUser, authorizeRoles("admin"), updateProductDiscount); 
// router.route("/admin/product/remove-discount/:productId").delete(isAuthenticatedUser, authorizeRoles("admin"), removeProductDiscount); 




// // Product Review
// // http://localhost:4000/api/v1/reviews?=&id=66d5ab1e7b26767517527083
// router.route('/reviews').get(isAuthenticatedUser, getProductReviews)

// // http://localhost:4000/api/v1/review
// // productId
// // rating
// // comment
// router.route("/review").post(isAuthenticatedUser, createProductReview);

// // http://localhost:4000/api/v1/reviews?productId=66d5ab1e7b26767517527083&reviewId=676404529f6ba8cc6c84b975
// router.route('/reviews').delete(isAuthenticatedUser, deleteReview)

router.route('/products/suggestions').get(getProductSuggestions);

module.exports = router;
