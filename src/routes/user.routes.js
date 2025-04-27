const express = require('express');
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth.middleware');
const { getAllUsers, updateUserRole, deleteUser, updateUserProfile, getProfile, paymentApprove, storeProductsBlacklist, getAllProductsFromBlacklist , storeSuspension , getAllSuspensionStores , recoverStore , removeProductFromBlacklist , info , getInfo  } = require('../controllers/user.controller');
const { imageUpload } = require('../middlewares/multer.middleware');

const router = express.Router();

 
router.route('/profile').get(isAuthenticatedUser, getProfile);                   
router.route('/admin/users').get(isAuthenticatedUser, authorizeRoles('admin'), getAllUsers);

// http://localhost:4000/api/v1/admin/users/67648fcb420dcebb733e6077/admin
router.route('/admin/users/:userId/:role').put( isAuthenticatedUser, authorizeRoles('admin'), updateUserRole);

router.route("/update-profile").put(isAuthenticatedUser, imageUpload.single('photo') , updateUserProfile);

router.route('/admin/users/:userId').delete( isAuthenticatedUser, authorizeRoles('admin'), deleteUser);
router.route('/payment-approve/:storeId').post(isAuthenticatedUser, authorizeRoles('admin'), paymentApprove);
router.put('/info' , info)
router.get('/info' , getInfo);
//store products blacklist
router.route('/store-products-blacklist/:storeId').post(isAuthenticatedUser, authorizeRoles('admin'), storeProductsBlacklist);
router.route('/store-products-blacklist').get(isAuthenticatedUser, authorizeRoles('admin'), getAllProductsFromBlacklist);
router.route('/store-suspension/:storeId').post(isAuthenticatedUser, authorizeRoles('admin'), storeSuspension);
router.route('/all-suspension-stores').get(isAuthenticatedUser, authorizeRoles('admin'), getAllSuspensionStores);
router.route('/recover-store/:storeId').post(isAuthenticatedUser, authorizeRoles('admin'), recoverStore);
router.route('/remove-product-from-blacklist/:storeId').post(isAuthenticatedUser, authorizeRoles('admin'), removeProductFromBlacklist);


module.exports = router;
