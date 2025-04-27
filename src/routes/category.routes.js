const express = require('express');
const router = express.Router();
const {
  createCategory,
  getCategoriesBySeller,
  updateCategory,
  deleteCategory,
  addSubcategory,
  updateSubcategory,
  deleteSubcategory,
  getCategoriesByIds,
  getAllCategories,
} = require('../controllers/category.controller');
const { isAuthenticatedUser, authorizeRoles, isAuthenticatedStore } = require('../middlewares/auth.middleware');

router.route('/category').post(isAuthenticatedStore, createCategory); //done
router.route('/category').get(isAuthenticatedStore,getCategoriesBySeller); //done
router.route('/allcategory').get(getAllCategories); //done
router.route('/categories').post(getCategoriesByIds);  //done

router.route('/category/:categoryId').put(isAuthenticatedStore,updateCategory); //done

router.route('/category/:categoryId').delete(isAuthenticatedStore,deleteCategory); //done

router.route('/category/:categoryId/subcategories').post(isAuthenticatedStore,addSubcategory); //done

router.route('/category/:categoryId/subcategory/:subcategoryId').put(isAuthenticatedStore,updateSubcategory); //done

router.route('/category/:categoryId/subcategory/:subcategoryId').delete(
  isAuthenticatedStore,
  deleteSubcategory
);

module.exports = router;
