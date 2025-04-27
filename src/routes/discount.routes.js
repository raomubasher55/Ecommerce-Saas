
const express = require('express');
const { isAuthenticatedStore } = require('../middlewares/auth.middleware');
const { updateDiscount, removeDiscount } = require('../controllers/discount.controller');

const router = express.Router();



/**
    * Route to update the discount of a product.
    * @name put/admin/product/discount/:productId
    * @memberof module:discountRoutes
    * @inner
    * @param {function} isAuthenticatedUser - Middleware to check if the user is authenticated.
    * @param {function} authorizeRoles - Middleware to check if the user has the admin role.
    * @param {function} updateProductDiscount - Controller function to update the product discount.
    */
router.route("/:productId").put(isAuthenticatedStore, updateDiscount); 


/**
 * Route to remove the discount from a product.
    * @name delete/admin/product/remove-discount/:productId
    * @function
    * @memberof module:discountRoutes
    * @inner
    * @param {function} isAuthenticatedUser - Middleware to check if the user is authenticated.
    * @param {function} authorizeRoles - Middleware to check if the user has the admin role.
    * @param {function} removeProductDiscount - Controller function to remove the product discount.
*/
router.route("/:productId").delete(isAuthenticatedStore, removeDiscount); 


module.exports = router;