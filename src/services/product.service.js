const Product = require("../models/product.model");
const Category = require("../models/category.model");
const ApiError = require("../utils/ApiError");
const mongoose = require("mongoose");
const APIFeaturesClass = require('../utils/apiFeatures'); 
const imageUtils = require('../utils/imageUtils');
const Package = require("../models/Package.model");
const Store = require("../models/store.model");

// Get All Products
// exports.getProducts = async (query) => {
//   const resPerPage = 100;

//   // First, get all active store IDs
//   const now = new Date();

//   const activeStores = await Store.find({
//     status: "active",
//     $or: [
//       { "package.expiresAt": { $gt: now } },
//       { "package.expiresAt": null }
//     ]
//   }).select('_id');
//     const activeStoreIds = activeStores.map(store => store._id);

//   // Create base query to only get products from active stores
//   const baseQuery = { seller: { $in: activeStoreIds } };

//   // Count total products from active stores
//   const productsCount = await Product.countDocuments(baseQuery);

//   // Initialize APIFeatures with the base query
//   const apiFeatures = new APIFeaturesClass(
//     Product.find(baseQuery).populate({
//       path: 'seller',
//       select: 'name email status photo'
//     }),
//     query
//   )
//     .search()
//     .filter()
//     .pagination(resPerPage);

//   // Get filtered count
//   const filteredProductsCount = await apiFeatures.query.clone().countDocuments();

//   // Fetch products with populated seller info
//   const products = await apiFeatures.query.clone();

//   return {
//     success: true,
//     productsCount,
//     resPerPage,
//     filteredProductsCount,
//     products
//   };
// };
// In product.service.js
exports.getProducts = async (query) => {
  const resPerPage = 100;

  // Middleware automatically filters products by active stores with active packages
  const productsCount = await Product.countDocuments();

  const apiFeatures = new APIFeaturesClass(
    Product.find().populate({
      path: 'seller',
      select: 'name email status photo'
    }),
    query
  )
    .search()
    .filter()
    .pagination(resPerPage);

  const filteredProductsCount = await apiFeatures.query.clone().countDocuments();
  const products = await apiFeatures.query.clone();

  return {
    success: true,
    productsCount,
    resPerPage,
    filteredProductsCount,
    products
  };
};






exports.getProductsByCategory = async (categoryName) => {
  try {
    const categories = await Category.find();
    if (!categories || categories.length === 0) {
      return { message: 'No categories found' };
    }
    const matchingCategories = categories.filter(category =>
      category.name.toLowerCase() === categoryName.toLowerCase()
    );
    if (matchingCategories.length === 0) {
      return { message: 'No categories found matching the provided category name' };
    }
    const categoryIds = matchingCategories.map(category => category._id);
    const products = await Product.find({ category: { $in: categoryIds } });
    if (!products || products.length === 0) {
      return { message: 'No products found for this category' };
    }
    return { products };
  } catch (error) {
    console.error(error);
    return { message: 'Error fetching products by category' };
  }
};





// get products with Store
exports.getProductsWithStore = async (query) => {
  const resPerPage = 4;
  const productsCount = await Product.countDocuments();

  // Check for ID filtering
  if (query.filter && query.filter._id && query.filter._id.$in) {
    const productIds = query.filter._id.$in;
    // Execute the query with product IDs
    const products = await Product.find({ _id: { $in: productIds } });
    const filteredProductsCount = products.length;

    return {
      productsCount,
      resPerPage,
      filteredProductsCount,
      products
    };
  }

  // Fallback in case no IDs are provided, apply other filters, etc.
  const apiFeatures = new APIFeaturesClass(Product.find(), query)
    .search()
    .filter()
    .pagination(resPerPage);

  const filteredProductsCount = await apiFeatures.query.clone().countDocuments();
  const products = await apiFeatures.query;

  return {
    productsCount,
    resPerPage,
    filteredProductsCount,
    products
  };
};

// Fetch products by store
exports.getProductsByStore = async (storeId, query) => {
  const resPerPage = 4;
  const productsCount = await Product.countDocuments({ seller: storeId });

  const apiFeatures = new APIFeaturesClass(Product.find({ seller: storeId }), query)
    .search()
    .filter()
    .pagination(resPerPage);

  const filteredProductsCount = await apiFeatures.query.clone().countDocuments();
  const products = await apiFeatures.query;

  return { productsCount, resPerPage, filteredProductsCount, products };
};


exports.getProductsByStore = async (storeId) => {
  const resPerPage = 4; 
  const productsCount = await Product.countDocuments({ seller: storeId });
  const products = await Product.find({ seller: storeId });
  const totalPages = Math.ceil(productsCount / resPerPage);
  return {
    productsCount,
    totalPages,
    products
  };
};


// Get Single Product
exports.getSingleProduct = async (id) => {
  const product = await Product.findById(id);
  if (!product) {
    throw new ApiError("Product not found", 404);
  }
  return product;
};

// Create Product
exports.createProduct = async (productData, store, images) => {
  if(!productData.category){
    throw new ApiError("Category is required", 400);
  }
  const categoryExists = await Category.findById(productData.category);
  if (!categoryExists) {
    throw new ApiError("Category does not exist", 400);
  }


  const subcategoryExists = categoryExists.subcategories.some(
    (subcat) => subcat._id.toString() === productData.subcategory
  );
  if (!subcategoryExists) {
    throw new ApiError("Subcategory does not exist under this category", 400);
  }
  // const projectLimit = await Package.findOne({ name: store.package.name });
  // console.log(projectLimit , 'limit')
  // if (store.products.length >= projectLimit.features.productLimit) {
  //   throw new ApiError("Product limit reached", 400);
  // }

  if(productData.discountPercentage && productData.discountPercentage <= 0){
    throw new ApiError("Discount percentage must be greater than 0" , 400);
  }


  if(productData.discountPercentage && productData.discountPercentage > 0){
    if(!productData.discountStartDate || !productData.discountEndDate){
      throw new ApiError("Discount start and end dates are required", 400);
    }
  }



  const product = new Product({
    ...productData,
    images,
    seller: store._id,
  });

  store.products.push(product._id);
  await store.save({validateBeforeSave: false});

  await product.save({validateBeforeSave: false});
  return product;
};

// Update Product
exports.updateProduct = async (id, updateData, images = null) => {
  const product = await Product.findById(id);
  if (!product) {
    throw new ApiError("Product not found", 404);
  }
  if (images) {
    if (product.images && product.images.length > 0) {
      product.images.forEach(async (image) => {  
        await imageUtils.deleteImage(image.url, 'local');
      });
    }
    updateData.images = images;
  }
  const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!updatedProduct) {
    throw new ApiError("Error updating product", 500);
  }

  return updatedProduct;
};

// Delete Product
exports.deleteProduct = async (id) => {
  const product = await Product.findById(id);
  if (!product) {
    throw new ApiError("Product not found", 404);
  }

  await product.deleteOne();
  return true;
};



exports.bulkUploadProducts = async (productDataArray) => {
    const products = await Product.insertMany(productDataArray, { ordered: false });
    return products;
  };
  