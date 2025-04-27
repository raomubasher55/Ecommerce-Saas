const express = require("express");
const router = express.Router();
const {
  createPackageAndProcessPayment,
  getAllPackages,
  getPackageById,
  updatePackage,
  deletePackage,
  confirmPayment,
} = require("../controllers/package.controller");
const { isAuthenticatedUser, authorizeRoles, isAuthenticatedStore, authorizeRolesAndStoreAccess, isAuthenticatedStoreOrUser } = require("../middlewares/auth.middleware");
 
router.post("/", isAuthenticatedStore, createPackageAndProcessPayment);

router.get("/confirm-payment/:packageId", isAuthenticatedStore, confirmPayment);
router.get("/", isAuthenticatedUser, authorizeRoles('admin'), getAllPackages);

router.get("/:id", isAuthenticatedStoreOrUser,
  authorizeRolesAndStoreAccess("admin", "storeowner"), getPackageById);

router.put("/:id", isAuthenticatedUser, authorizeRoles('admin'), updatePackage);

router.delete("/:id", isAuthenticatedUser, authorizeRoles('admin'), deletePackage);



module.exports = router;
