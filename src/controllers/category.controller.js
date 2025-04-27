const categoryService = require('../services/category.service');
const ApiError = require('../utils/ApiError');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors.middleware');

exports.createCategory = catchAsyncErrors(async (req, res, next) => {
  const { name } = req.body;
  const category = await categoryService.createCategory(req.store._id, name);
  res.status(201).json({message: 'Category created successfully',category});
}); 

exports.getCategoriesBySeller = catchAsyncErrors(async (req, res, next) => {
  const categories = await categoryService.getCategoriesBySeller(req.store._id);
  res.status(200).json({categories});
});

exports.getAllCategories = catchAsyncErrors(async (req, res, next) => {
  const categories = await categoryService.getAllCategories();
  res.status(200).json({categories});
});

exports.getCategoriesByIds = catchAsyncErrors(async (req, res, next) => {
  const { categoryIds } = req.body; // Receive category IDs as part of the request body

  if (!categoryIds || categoryIds.length === 0) {
    return res.status(400).json({ message: "No category IDs provided" });
  }

  const categories = await categoryService.getCategoriesByIds(categoryIds);

  if (!categories || categories.length === 0) {
    return res.status(404).json({ message: "No categories found" });
  }

  // Send back the matched categories
  res.status(200).json({ categories });
});

exports.updateCategory = catchAsyncErrors(async (req, res, next) => {
  const { categoryId } = req.params;
  const { name } = req.body;
  const category = await categoryService.updateCategory(req.store._id, categoryId, name);
  res.status(200).json({message: 'Category updated successfully',category});
});

exports.deleteCategory = catchAsyncErrors(async (req, res, next) => {
  const { categoryId } = req.params;
  await categoryService.deleteCategory(req.store._id, categoryId);
  res.status(200).json({message: 'Category deleted successfully'});
});

exports.addSubcategory = catchAsyncErrors(async (req, res, next) => {
  const { categoryId } = req.params;
  const { name, description } = req.body;
  const category = await categoryService.addSubcategory(req.store._id, categoryId, name, description);
  res.status(200).json({message: 'Subcategory added successfully',category});
});

exports.updateSubcategory = catchAsyncErrors(async (req, res, next) => {
  const { categoryId, subcategoryId } = req.params;
  const { name, description } = req.body;
  const category = await categoryService.updateSubcategory(req.store._id, categoryId, subcategoryId, name, description);
  res.status(200).json({message: 'Subcategory updated successfully',category});
});

exports.deleteSubcategory = catchAsyncErrors(async (req, res, next) => {
  const { categoryId, subcategoryId } = req.params;
  const category = await categoryService.deleteSubcategory(req.store._id, categoryId, subcategoryId);
  res.status(200).json({message: 'Subcategory deleted successfully',category});
});
