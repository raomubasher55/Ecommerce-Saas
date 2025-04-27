const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const catchAsyncErrors = require("./catchAsyncErrors.middleware");
const ApiError = require("../utils/ApiError");
const Store = require("../models/store.model");
const Product = require('../models/product.model');
const Order = require('../models/order.model');

// check if user is authenticated or not
exports.isAuthenticatedUser = async (req, res, next) => {
  const token =
  req.cookies.token ||
  (req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
    ? req.headers.authorization.split(" ")[1]
    : null);
  if (!token) {
    return next(new ApiError("Login first to access this resource.", 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if(!user){
      return next(new ApiError('Please Login first to access this resouce' , 401))
    }else{
      if(user.isVerified === false){
        return next(new ApiError('Please verify your email first to access this resouce' , 401))
      }else{
        req.user = user;
      }
    }
    next();
  } catch (error) { 
    console.log("Token verification failed:", error.message);
    return next(new ApiError("Invalid or expired token.", 401));
  }
};

// Role
exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {
      if (!req.user) {
        return next(new ApiError('User not logged in. Only Admin can access this source.', 401));
      }
  
      if (!roles.includes(req.user.role)) {
        return next(
          new ApiError(`Role (${req.user.role}) is not allowed to access this resource.`, 403)
        );
      }
      next();
    };
}


// check is store is authenticated or not
exports.isAuthenticatedStore = catchAsyncErrors(async (req, res, next) => {

  const token =
  req.cookies.token ||
  (req.headers.authorization && req.headers.authorization.startsWith("Bearer")
  ? req.headers.authorization.split(" ")[1]
  : null);
  console.log("token")

  if (!token) {
    return next(new ApiError("Login first to access this resource.", 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const store = await Store.findById(decoded.id);
    if(!store){
      return next(new ApiError('Please Login first to access this resouce' , 401))
    }else{
      if(store.emailVerified === false){
        return next(new ApiError('Please verify your email first to access this resouce' , 401))
      }else{
        req.store = store;
      }
    }
    next();
  } catch (error) {
    return next(new ApiError("Invalid Token", 401, error));
  }
});


exports.authorizeRolesAndStoreAccess = (...roles) => {
  return async (req, res, next) => {
    if (!req.user && !req.store) {
      return next(new ApiError("You are not logged in.", 401));
    }

    if (req.user && !roles.includes(req.user.role)) {
      return next(
        new ApiError(`Role (${req.user.role}) is not allowed to access this resource.`, 403)
      );
    }

    if (req.store) {
      const product = await Product.findById(req.params.id);
      if (product && product.seller.toString() !== req.store._id.toString()) {
        return next(new ApiError("You are not authorized to access this resource.", 403));
      }

      const order = await Order.findById(req.params.id);
      if(order && order.store.toString() !== req.store._id.toString()){
        return next(new ApiError("You are not authorized to access this resource", 403));
      }
    }

    next();
  };
};


exports.isAuthenticatedStoreOrUser = async (req, res, next) => {
  const token =
    req.cookies.token ||
    (req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
      ? req.headers.authorization.split(" ")[1]
      : null);

  if (!token) {
    return next(new ApiError("Login first to access this resource.", 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("Decoded token: " , decoded);

    // Check if it's a store
    const store = await Store.findById(decoded.id);
    console.log("Store: "  , store);
    if (store) {
      if(store.emailVerified === false){
        return next(new ApiError('Please verify your email first to access this resouce' , 401))
      }else{
        req.store = store;
      }
      return next();
    }

    // Check if it's a user
    const user = await User.findById(decoded.id);
    console.log("user : " , user) 
    if (user) {
      if(user.isVerified === false){
        return next(new ApiError('Please verify your email first to access this resouce' , 401))
      }else{
        req.user = user;
      }
      return next();
    }

    return next(new ApiError("Invalid token or user/store not found.", 401));
  } catch (error) {
    console.log(error);
    return next(new ApiError("Invalid or expired token.", 401));
  }
};
