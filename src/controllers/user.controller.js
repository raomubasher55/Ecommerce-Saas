const catchAsyncErrors = require("../middlewares/catchAsyncErrors.middleware");
const userService = require("../services/user.service");
const ApiError = require("../utils/ApiError");
const User = require('../models/user.model')
// Update user profile
const fs = require("fs");
const path = require("path");

exports.updateUserProfile = catchAsyncErrors(async (req, res, next) => {
  const { name, email, mobile } = req.body;
  let updateData = {};

  // Find the existing user
  const user = await User.findById(req.user._id);
  if (!user) {
    return next(new ApiError("User not found", 404));
  }

  // Delete the old avatar if a new one is uploaded
  if (req.file) {
    const oldAvatarPath = path.join(__dirname, `../public${user.avatar.url}`);
    if (fs.existsSync(oldAvatarPath)) {
      fs.unlinkSync(oldAvatarPath); // Delete old file
    }

    updateData.avatar = {
      public_id: req.file.filename,
      url: `/uploads/images/${req.file.filename}`, // Store new path
    };
  }

  // Update other fields
  if (name) updateData.name = name;
  if (email) updateData.email = email;
  if (mobile) updateData.mobile = mobile;

  // Update User
  const updatedUser = await User.findByIdAndUpdate(req.user._id, updateData, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    message: "Profile updated successfully",
    user: updatedUser,
  });
});




exports.getProfile = catchAsyncErrors(async (req, res, next) => {
  const user = await userService.getUserById(req.user._id);
  if (!user) {
    return next(new ApiError("User not found", 404));
  }

  res.status(200).json({
    message: "Profile fetched successfully",
    user,
  });
});


// Get all users (accessible to superadmin)
exports.getAllUsers = catchAsyncErrors(async (req, res, next) => {
  const filter = {}; 

  const users = await userService.queryUsers(filter, {});

  res.status(200).json({
    users: users.docs,    
    totalUsers: users.totalDocs, 
  });
});



// Update a user's role (admin, superadmin, or user)
exports.updateUserRole = catchAsyncErrors(async (req, res, next) => {
  const { userId, role } = req.params;

  const validRoles = ["user", "admin", "superadmin"];
  if (!validRoles.includes(role)) {
    return next(new ApiError("Invalid role provided", 400));
  }

  const user = await userService.getUserById(userId);
  if (!user) {
    return next(new ApiError("User not found", 404));
  }

  if (
    userId.toString() === req.user.id.toString() &&
    req.user.role === "superadmin"
  ) {
    return next(new ApiError("Superadmin cannot change their own role", 400));
  }

  user.role = role;

  if (role === "admin" && Array.isArray(user.documents)) {
    user.documents.forEach((doc) => {
      doc.status = "approved";
    });
  }

  const updatedUser = await userService.updateUserById(userId, { role });

  res.status(200).json({
    success: true,
    message: `User role updated to ${role}`,
    user: {
      id: updatedUser._id,
      role: updatedUser.role,
    },
  });
});


// Delete a user (accessible to superadmin)
exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
  const userId = req.params.userId;
  const user = await userService.getUserById(userId);

  if (!user) {
    return next(new ApiError("User not found", 404));
  }
  if (
    userId.toString() === req.user._id.toString() &&
    req.user.role === "superadmin"
  ) {
    return next(
      new ApiError("Superadmin cannot delete their own account", 400)
    );
  }
  await userService.deleteUserById(userId);
  res.status(200).json({ message: "User deleted successfully"});
});


exports.paymentApprove = catchAsyncErrors(async (req, res, next) => {
  const { storeId } = req.params;
  const { amount } = req.body;
  const response = await userService.paymentApprove(storeId, amount);
  res.status(200).json({ message: "Payment approved successfully"});
});

exports.storeProductsBlacklist = catchAsyncErrors(async (req, res, next) => {
  const { storeId } = req.params;
  const { productId } = req.body;
  const response = await userService.storeProductsBlacklist(storeId, productId);
  res.status(200).json({ message: "Product blacklisted successfully"});
});


exports.getAllProductsFromBlacklist = catchAsyncErrors(async (req, res, next) => {
  const products = await userService.getAllProductsFromBlacklist();
  res.status(200).json(products);
});


exports.removeProductFromBlacklist = catchAsyncErrors(async (req, res, next) => {
  const { storeId } = req.params;
  const { productId } = req.body;
  const response = await userService.removeProductFromBlacklist(storeId, productId);
  res.status(200).json({ message: "Product removed from blacklist successfully"});
});

exports.storeSuspension = catchAsyncErrors(async (req, res, next) => {
  const { storeId } = req.params;
  const { suspensionReason } = req.body;
  const response = await userService.storeSuspension(storeId, suspensionReason);
  res.status(200).json(response);
});

exports.getAllSuspensionStores = catchAsyncErrors(async (req, res, next) => {
  const response = await userService.getAllSuspensionStores();
  res.status(200).json(response);
});

exports.recoverStore = catchAsyncErrors(async (req, res, next) => {
  const { storeId } = req.params;
  const response = await userService.recoverStore(storeId);
  res.status(200).json(response);
});


exports.info = catchAsyncErrors(async(req,res)=>{
  const info = req.body;
  const response = await userService.infoService(info);
  res.status(200).json({ message: "Info updated successfully"});
})

exports.getInfo = catchAsyncErrors(async(req,res)=>{
  const info  = await userService.getInfoService();
  res.status(200).json({info});
})