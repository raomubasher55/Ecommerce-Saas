
const Category = require('../models/category.model');
const ApiError = require('../utils/ApiError');
const Store = require('../models/store.model');

/**
 * Creates a new category for a seller.
 * @param {string} sellerId - The ID of the seller.
 * @param {string} name - The name of the category.
 * @returns {Promise<Object>} The created category.
 * @throws {ApiError} If the seller already has a category.
 */
exports.createCategory = async (sellerId, name) => {
    const store = await Store.findById(sellerId);
    if (!store) {
      throw new ApiError('Store not found', 404);
    }
    const existingCategory = await Category.findOne({ seller: sellerId });  
    if (existingCategory) {
      throw new ApiError('You can only add one category', 400);
    }
  
    const category = await Category.create({
      seller: sellerId,
      name,
      subcategories: [],
    });
  
    store.category = category._id;
    store.save();
    return category;
  };
  

/**
 * Retrieves all categories for a seller.
 * @param {string} sellerId - The ID of the seller.
 * @returns {Promise<Array>} An array of categories.
 */
exports.getCategoriesBySeller = async (sellerId) => {
    const categories = await Category.find({ seller: sellerId });
    return categories;
  };
  
  exports.getAllCategories = async () => {
    const categories = await Category.find();
    return categories;
  };

  // Service function to get category by categoryId
  exports.getCategoriesByIds = async (categoryIds) => {
    const categories = await Category.find({ '_id': { $in: categoryIds } });
    return categories; // Returns an array of matched categories
  };
/**
 * Updates a category for a seller.
 * @param {string} sellerId - The ID of the seller.
 * @param {string} categoryId - The ID of the category to update.
 * @param {string} name - The new name of the category.
 * @returns {Promise<Object>} The updated category.
 * @throws {ApiError} If the category is not found.
 */
exports.updateCategory = async (sellerId, categoryId, name) => {
    const category = await Category.findOneAndUpdate(
      { _id: categoryId, seller: sellerId },
      { name },
      { new: true }
    );
    if (!category) {
      throw new ApiError('Category not found', 404);
    }
  
    return category;
  };

/**
 * Deletes a category for a seller.
 * @param {string} sellerId - The ID of the seller.
 * @param {string} categoryId - The ID of the category to delete.
 * @returns {Promise<Object>} The deleted category.
 * @throws {ApiError} If the category is not found.
 */
exports.deleteCategory = async (sellerId, categoryId) => {
    const category = await Category.findOneAndDelete({
      _id: categoryId,
      seller: sellerId,
    });
  
    if (!category) {
      throw new ApiError('Category not found', 404);
    }
  
    return category;
  };
  

/**
 * Adds a subcategory to a category.
 * @param {string} sellerId - The ID of the seller.
 * @param {string} categoryId - The ID of the category.
 * @param {string} name - The name of the subcategory.
 * @param {string} description - The description of the subcategory.
 * @returns {Promise<Object>} The updated category with the new subcategory.
 * @throws {ApiError} If the category is not found or the seller does not have permission.
 */
exports.addSubcategory = async (sellerId, categoryId, name, description) => {
    const category = await Category.findOne({ _id: categoryId, seller: sellerId });
  
    if (!category) {
      throw new ApiError('Category not found or you do not have permission to edit it', 404);
    }
  
    category.subcategories.push({ name, description });
    await category.save({validateBeforeSave: false});
  
    return category;
  };
/**
 * Updates a subcategory within a category.
 * @param {string} sellerId - The ID of the seller.
 * @param {string} categoryId - The ID of the category.
 * @param {string} subcategoryId - The ID of the subcategory to update.
 * @param {string} name - The new name of the subcategory.
 * @param {string} description - The new description of the subcategory.
 * @returns {Promise<Object>} The updated category with the updated subcategory.
 * @throws {ApiError} If the category or subcategory is not found.
 */
exports.updateSubcategory = async (sellerId, categoryId, subcategoryId, name, description) => {
    const category = await Category.findOne({ _id: categoryId, seller: sellerId });
  
    if (!category) {
      throw new ApiError('Category not found', 404);
    }
  
    const subcategory = category.subcategories.id(subcategoryId);
  
    if (!subcategory) {
      throw new ApiError('Subcategory not found', 404);
    }
  
    subcategory.name = name || subcategory.name;
    subcategory.description = description || subcategory.description;
  
    await category.save({validateBeforeSave: false});
  
    return category;
  };
  
/**
 * Deletes a subcategory from a category.
 * @param {string} sellerId - The ID of the seller.
 * @param {string} categoryId - The ID of the category.
 * @param {string} subcategoryId - The ID of the subcategory to delete.
 * @returns {Promise<Object>} The updated category with the subcategory removed.
 * @throws {ApiError} If the category or subcategory is not found.
 */
exports.deleteSubcategory = async (sellerId, categoryId, subcategoryId) => {
    const category = await Category.findOne({ _id: categoryId, seller: sellerId });
  
    if (!category) {
      throw new ApiError('Category not found', 404);
    }
  
    const subcategory = category.subcategories.id(subcategoryId);
  
    if (!subcategory) {
      throw new ApiError('Subcategory not found', 404);
    }
  
    subcategory.deleteOne();
    await category.save({validateBeforeSave: false});
  
    return category;
  };

