const express = require('express');
const router = express.Router();
const { isAuthenticatedStore, authorizeRoles, isAuthenticatedUser } = require('../middlewares/auth.middleware');
const { createStore, loginStore, updateStore, getStoreById, getAllStores, logoutStore, verifyEmail, forgotPassword, resetPassword, StoreById, calculateStoreSales, CardDetail, StoreCard, AllStoreCards, paymentWithdraw, getAllWithdrawals, approveWithdrawal, paymentDetails, getAllProductsFromBlacklist, reminderEmail, suspendStore, recoverStore, getSuspendedStores , getMonthlyRevenue } = require('../controllers/store.controller');
const { imageUpload } = require('../middlewares/multer.middleware');

router.route('/register').post(imageUpload.single('photo'), createStore); 
router.route('/verify-email/:token').get(verifyEmail);
router.route('/login').post(loginStore);  
router.route("/password/forgot").post(forgotPassword);
router.route("/password/reset/:token").put(resetPassword);
router.route('/profile').get(isAuthenticatedStore, getStoreById ); 
router.route('/store/:id').get( StoreById ); 
router.route('/update-profile').put(isAuthenticatedStore , updateStore); 
router.route('/all').get(isAuthenticatedUser, authorizeRoles('admin'), getAllStores); 
router.route('/all-store').get(getAllStores); 
router.route('/reminder-email').post(reminderEmail);
router.route('/logout').get(isAuthenticatedStore , logoutStore); 
router.get('/sales/:id', calculateStoreSales);
router.post('/card' , isAuthenticatedStore, CardDetail )
router.get("/store-card", isAuthenticatedStore , StoreCard )
router.get("/Allstore-cards", AllStoreCards );
router.route('/payment-withdraw').post(isAuthenticatedStore, paymentWithdraw);
router.route('/admin/withdrawals').get(isAuthenticatedUser, authorizeRoles('admin'), getAllWithdrawals);
router.route('/admin/withdrawals/:withdrawalId/approve').put(isAuthenticatedUser, authorizeRoles('admin'), approveWithdrawal);
router.route('/payment-details').put(isAuthenticatedStore, paymentDetails);
router.route('/get-all-blacklist-products').get(isAuthenticatedStore,  getAllProductsFromBlacklist);
router.route('/monthly-revenue').get( getMonthlyRevenue);

// Store suspension and recovery routes
router.route('/admin/stores/suspended')
  .get(isAuthenticatedUser, authorizeRoles('admin'), getSuspendedStores);

router.route('/admin/stores/:storeId/suspend')
  .post(isAuthenticatedUser, authorizeRoles('admin'), suspendStore);

router.route('/admin/stores/:storeId/recover')
  .post(isAuthenticatedUser, authorizeRoles('admin'), recoverStore);

module.exports = router; 