const Product = require("../models/product.model");
const ApiError = require("../utils/ApiError");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors.middleware");
const Category = require("../models/category.model");

const productService = require("../services/product.service");

// Get All Products
exports.getProducts = catchAsyncErrors(async (req, res, next) => {
  const result = await productService.getProducts(req.query);
  res.status(200).json(result);
});

// getAll by category 
exports.getProductsByCategory = catchAsyncErrors(async (req, res, next) => {
  const { categoryName } = req.params;
  const products = await productService.getProductsByCategory(categoryName);
  res.status(200).json({
    success: true,
    products, 
  });
});

exports.ProductsByStore = catchAsyncErrors(async (req, res, next) => {
  const { ids, ...otherQueryParams } = req.query;

  let queryOptions = { ...otherQueryParams };

  if (ids) {
    const productIds = ids.split(',').map(id => id.trim());
    queryOptions.filter = { _id: { $in: productIds } };
  }

  const result = await productService.getProductsWithStore(queryOptions);

  res.status(200).json({
    success: true,
    ...result
  });
});

exports.fetchStoreProducts = catchAsyncErrors(async (req, res, next) => {
  const storeId = req.store._id;
  
  const result = await productService.getProductsByStore(storeId, req.query);
  
  res.status(200).json({ success: true, products: result });
});

// Fetch all products by storeId
exports.fetchStoreProductsById = catchAsyncErrors(async (req, res, next) => {
  const storeId = req.params.storeId;
  
  if (!storeId) {
    return res.status(400).json({ success: false, message: 'Store ID is required' });
  }
  const result = await productService.getProductsByStore(storeId);
  res.status(200).json({ success: true, products: result });
});

// Get Single Product
exports.getSingleProduct = catchAsyncErrors(async (req, res, next) => {
  const product = await productService.getSingleProduct(req.params.id);
  res.status(200).json({ success: true, product });
});

// Create New Product
exports.newProduct = catchAsyncErrors(async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    throw new ApiError("Please upload images for the product", 400);
  }

  const images = req.files?.map((file) => ({
    url: file?.path || "",  
    filename: file?.filename || "",
    fileType: file?.mimetype || "unknown", 
  }));
  images?.forEach((img) => {
    console.log(`Image URL: ${img.url}, File Type: ${img.fileType}`);
  });

  const product = await productService.createProduct(req.body, req.store, images);
  
  res.status(201).json({ success: true, message: "Product created successfully", product });
});

// Update Product
exports.updateProduct = catchAsyncErrors(async (req, res, next) => {
  try {
    let images = [];

    // Handle existing images safely
    if (req.body.existingImages) {
      if (Array.isArray(req.body.existingImages)) {
        images = req.body.existingImages.map((img) => JSON.parse(img));
      } else {
        images = [JSON.parse(req.body.existingImages)];
      }
    }

    // Handle new uploaded images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => ({
        url: file.path,
        filename: file.filename,
      }));

      images = [...images, ...newImages];
    }

    console.log('Final images array:', images);
    console.log('Product data:', req.body);

    const updatedProduct = await productService.updateProduct(req.params.id, req.body, images);

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// Delete Product
exports.deleteProduct = catchAsyncErrors(async (req, res, next) => {
  await productService.deleteProduct(req.params.id);
  res.status(200).json({ success: true, message: "Product deleted successfully" });
});

// Bulk Upload Products
exports.bulkUploadProducts = catchAsyncErrors(async (req, res, next) => {
  const products = await productService.bulkUploadProducts(req.body.products);
  res.status(201).json({ success: true, products });
});

// Get Product Suggestions
exports.getProductSuggestions = catchAsyncErrors(async (req, res, next) => {
  const { query } = req.query;
  
  if (!query) {
    return res.status(400).json({
      success: false,
      message: "Please provide a search query"
    });
  }

  const products = await Product.find({
    name: { $regex: query, $options: 'i' }
  })
  .select('name')
  .limit(5);

  const suggestions = [...new Set(products.map(product => product.name))];

  res.status(200).json({
    success: true,
    suggestions
  });
});
