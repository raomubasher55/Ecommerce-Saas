const {default : httpStatus} = require('http-status');
const User = require('../models/user.model')
const ApiError = require('../utils/ApiError');
const sendEmail = require('../utils/sendEmail');
const Store = require('../models/store.model');
const crypto = require('crypto');
const { sendPasswordResetEmail } = require('./email.service');
const Product = require('../models/product.model');
const Info = require('../models/info.model');
const validator = require('validator');

/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createUser = async (userBody, avatar) => {

  if (!userBody.name || typeof userBody.name !== 'string' || userBody.name.trim() === '') {
    throw new ApiError('Name is required and must be a valid string', 400);
  }

  if (!userBody.email || typeof userBody.email !== 'string' || !validator.isEmail(userBody.email)) {
    throw new ApiError('A valid email is required', 400);
  }

  if (!userBody.mobile || typeof userBody.mobile !== 'string' || userBody.mobile.trim() === '') {
    throw new ApiError('Mobile number is required and must be a valid string', 400);
  }

  if (!userBody.password || typeof userBody.password !== 'string' || userBody.password.length < 6) {
    throw new ApiError('Password is required and must be at least 8 characters long', 400);
  }

  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError('Email already taken', 401);
  }

  if (await User.isMobileTaken(userBody.mobile)){
    throw new ApiError('Mobile number already taken' , 401);
  }


  const user = await User.create({
    ...userBody, 
    avatar, 
  });
  const token = user.getVerifyToken();
  user.verifyToken = token;
  await user.save({ validateBeforeSave: false });
  sendEmail({
    email: userBody.email,
    subject: "Verify your email",
    message: `Please verify your email by clicking on the link : ${process.env.FRONTEND_URL}/verify/${token}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4; border-radius: 5px; max-width: 600px; margin: auto;">
        <h2 style="color: #333; text-align: center;">Welcome to Our Platform!</h2>
        <p style="color: #555; font-size: 16px;">Hello,</p>
        <p style="color: #555; font-size: 16px;">Thank you for registering with us! We are excited to have you on board. To complete your registration, please verify your email address by clicking the button below:</p>
        <div style="text-align: center;">
          <a href="${process.env.FRONTEND_URL}/verify/${token}" style="display: inline-block; padding: 15px 30px; margin: 20px 0; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px; font-size: 18px;">Verify Email</a>
        </div>
        <p style="color: #555; font-size: 16px;">If you did not create an account, no further action is required. Your account will remain inactive until you verify your email.</p>
        <p style="color: #555; font-size: 16px;">If you have any questions, feel free to reach out to our support team.</p>
        <p style="color: #555; font-size: 16px;">Best regards,<br>Your Company Name</p>
        <footer style="margin-top: 20px; text-align: center; color: #aaa; font-size: 14px;">
          <p>© ${new Date().getFullYear()} Your Company Name. All rights reserved.</p>
        </footer>
      </div>
    `,
  });

  return user;
};

/**
 * Verify user
 * @param {string} token
 * @returns {Promise<User>}
 */
const verifyUser = async (token) => {
  const user = await User.findOne({ verifyToken:  token });
  console.log(user)
  if (!user) {
    throw new ApiError('User not found', 404);
  }
  if (user.verifyToken !== token) {
    throw new ApiError('Invalid token', 401);
  }
  if (user.verifyTokenExpires < Date.now()) {
    throw new ApiError('Token expired', 401);
  }
  user.isVerified = true;
  await user.save({ validateBeforeSave: false });
  return user;
}


const resendVerifyEmail = async (email) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError('User not found', 404);
  }
  const token = user.getVerifyToken();
  sendEmail({
    email: user.email,
    subject: "Verify your email",
    message: `Please verify your email by clicking on the link : ${process.env.FRONTEND_URL}/verify/${token}`,
    html: `<p>Please verify your email by clicking on the link : <a href="${process.env.FRONTEND_URL}/verify/${token}">Verify</a></p>`,
  });
  return user;
}

/**
 * Login with email and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<User>}
 */
const loginWithEmailAndPassword = async (email, password) => {
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
        throw new ApiError('Incorrect email or password', 401);
    }
    return user;
};



/**
 * Forgot password
 * @param {string} email
 * @param {string} protocol
 * @param {string} host
 * @returns {Promise<void>}
 */
const forgetPasswordService = async (email, protocol, host) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError('User not found', 404);
  }

  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  try {
    await sendPasswordResetEmail(user.email, resetToken , host , protocol);
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save({ validateBeforeSave: false });
    throw new ApiError('Email could not be sent', 500);
  }
};

/**
 * Reset password
 * @param {string} token
 * @param {string} password
 * @param {string} confirmPassword
 * @returns {Promise<void>}
 */
const resetPasswordService = async (token, password, confirmPassword) => {
  const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError('Invalid token or token is expired', 400);
  }

  if (password !== confirmPassword) {
    throw new ApiError('Passwords do not match', 400);
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save({ validateBeforeSave: false });
};



/**
 * Query for users
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryUsers = async (filter) => {
  const users = await User.find(filter); 

  return {
    docs: users,           
    totalDocs: users.length, 
  };
};


/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getUserById = async (id) => {
  let user =  await User.findById(id).lean();
  console.log(user);
  if(!user){
    throw new ApiError(httpStatus.FORBIDDEN,'User Not Found!')
  }
  return user;
};

/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<User>}
 */
const getUserByEmail = async (email) => {
  const usera=await User.findOne({ email:email }).select('+password');
  return usera
};

const updateUserByEmail= async(email,password) => {
  return await User.findOneAndUpdate({email:email},{"password":password});
}
const updateUser = async (query,body) =>{
  return await User.findOneAndUpdate(query,body);
}
const getUserByAddress = async (address) => {
  return User.findOne({ address }).lean();
};

// /**
//  * Get user by id
//  * @param {ObjectId} userId
//  * @param {Object} updateBody
//  * @returns {Promise<User>}
//  */
// const blockUserById = async (userId,updateBody)=>{
//   const user = await User.findByIdAndUpdate(userId,updateBody,{new:true}).lean()
//   return user;
// }

/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const updateUserById = async (userId, updateBody) => {
  const user = await User.findByIdAndUpdate(userId,updateBody, {
    new: true,
  });
  return user;
};

/**
 * Delete user by id
 * @param {ObjectId} userId
 * @returns {Promise<User>}
 */
const deleteUserById = async (userId) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  await User.findByIdAndDelete(userId);
};

/**
 *
 * @param {ObjectId} userId
 * @param {ObjectId} artworkId
 * @returns {Promise<User>}
 */
const addArtworkToFavourites = async (userId, artworkId) => {
  return await User.findOneAndUpdate({ _id: userId }, { $push: { favouriteArtworks: artworkId } }).lean();
};

/**
 *
 * @param {ObjectId} userId
 * @param {ObjectId} artworkId
 * @returns {Promise<User>}
 */
const removeArtworkFromFavourite = async (userId, artworkId) => {
  return await User.findOneAndUpdate({ _id: userId }, { $pull: { favouriteArtworks: artworkId } }).lean();
};

/**
 *
 * @param {ObjectId} userId
 * @param {number} page
 * @param {number} perPage
 */

const getFavouriteArtworks = async (userId, page, perPage) => {
  const user = await User.findOne({ _id: userId })
    .select(['favouriteArtworks'])
    .populate('favouriteArtworks')
    .limit(parseInt(perPage))
    .skip(page * perPage)
    .lean();

  return user ? user.favouriteArtworks : [];
};

const followOtherUser = async (userId, otherUserId) => {
  await User.findOneAndUpdate({ _id: otherUserId }, { $push: { followers: userId } }, { new: true });
  return await User.findOneAndUpdate({ _id: userId }, { $push: { following: otherUserId } }, { new: true }).lean();
};

const unFollowUser = async (userId, otherUserId) => {
  await User.findOneAndUpdate({ _id: otherUserId }, { $pull: { followers: userId } }, { new: true });
  return await User.findOneAndUpdate({ _id: userId }, { $pull: { following: otherUserId } }, { new: true }).lean();
};

const getUserFollowers = async (userId, page, perPage) => {
  const user = await User.findOne({ _id: userId })
    .populate({
      path: 'followers',
      options: {
        limit: parseInt(perPage),
        skip: page * perPage,
      },
    })
    .lean();
  return user.followers;
};

const getUserFollowing = async (userId, page, perPage) => {
  const user = await User.findOne({ _id: userId })
    .populate({
      path: 'following',
      options: {
        limit: parseInt(perPage),
        skip: page * perPage,
      },
    })
    .lean();
  return user.following;
};

const removeArtwork = async (userId, artworkId) => {
  await User.findOneAndUpdate({ _id: userId }, { $pull: { artworks: artworkId } });
};

const searchUsersByName = async (keyword, page, perPage) => {
  return await User.find({ userName: { $regex: keyword, $options: 'i' } })
    .limit(parseInt(perPage))
    .skip(page * perPage);
};

const saveForgotPasswordCode= async(email, code) => {
  return await User.findOneAndUpdate({email:email},{$set:{"code":code}});
}

const addCategories = async(userId,categories,selectedSubCategoryPercentage)=>{
  const user = await User.findByIdAndUpdate(userId,
    {category:categories,sub_category_percentage:selectedSubCategoryPercentage},
    {new:true});
  return user;
}

const paymentApprove = async(storeId, amount)=>{
  const store = await Store.findById(storeId);
  if(!store){
    throw new ApiError("Store not found", 404);
  }
  store.earnings += amount;
  store.totalSales -= amount;
  sendEmail({
    to: store.email,
    subject: "Payment Approved",
    text: `Dear Store Owner,\n\nWe are pleased to inform you that your payment withdrawal request for $${amount} has been successfully approved and is now being processed. The amount will be transferred to your registered bank account within 3-5 business days.\n\nHere's a summary of your transaction:\n- Withdrawal Amount: $${amount}\n- Status: Approved\n- Processing Time: 3-5 business days\n\nPlease note that the actual time of receipt may vary depending on your bank's processing schedule. You will receive another notification once the transfer has been completed.\n\nIf you have any questions about this transaction or need further assistance, please don't hesitate to contact our support team at support@example.com or through your dashboard.\n\nThank you for your continued partnership with us.\n\nBest regards,\nThe Admin Team`,
  });
  await store.save({validateBeforeSave: false});
  return store;
}

/**
 * Store products blacklist
 * @param {ObjectId} storeId
 * @param {ObjectId} productId
 * @returns {Promise<Store>}
 */
const storeProductsBlacklist = async(storeId, productId) => {
  const store = await Store.findById(storeId);
  if (!store) {
    throw new ApiError("Store not found", 404);
  }
  if (store.productsBlacklist.includes(productId)) {
    throw new ApiError("Product already in blacklist", 400);
  }
  if (!store.products.includes(productId)) {
    throw new ApiError("Product not found in store", 400);
  }
  
  // Remove product from products and add to productsBlacklist
  store.products = store.products.filter(product => product.toString() !== productId);
  store.productsBlacklist.push(productId);
  
  await store.save({validateBeforeSave:false});
  return store;
}


/**
 * Remove product from store products blacklist
 * @param {ObjectId} storeId
 * @param {ObjectId} productId
 * @returns {Promise<Store>}
 */
const removeProductFromBlacklist = async(storeId, productId) => {
  const store = await Store.findById(storeId);
  if (!store) {
    throw new ApiError("Store not found", 404);
  }
  if (!store.productsBlacklist.includes(productId)) {
    throw new ApiError("Product not in blacklist", 400);
  }
  
  // Remove product from productsBlacklist and add to products
  store.productsBlacklist = store.productsBlacklist.filter(product => product.toString() !== productId);
  store.products.push(productId);
  
  await store.save({validateBeforeSave:false});
  return store;
}


/**
 * Get all products from store products blacklist
 * @param {ObjectId} storeId
 * @returns {Promise<Store>}
 */
const getAllProductsFromBlacklist = async () => {
  const stores = await Store.find({}, 'productsBlacklist'); // Fetch only the blacklist arrays
  const productIds = stores.flatMap(store => store.productsBlacklist); // Collect all blacklisted product IDs
  const products = await Product.find({ _id: { $in: productIds } }); // Fetch blacklisted products
  return products;
};



/**
 * Store suspension
 * @param {ObjectId} storeId
 * @param {string} suspensionReason
 * @returns {Promise<Store>}
 */ 
const storeSuspension = async(storeId, suspensionReason) => {
  const store = await Store.findById(storeId);
  if (!store) {
    throw new ApiError("Store not found", 404);
  }
  store.status = "suspended";
  store.suspensionReason = suspensionReason;
  await store.save({validateBeforeSave:false});
  return store;
}

/**
 * Get all suspension stores
 * @returns {Promise<Store>}
 */
const getAllSuspensionStores = async() => {
  const stores = await Store.find({ status: "suspended" });
  return stores;
}

/**
 * Recover store
 * @param {ObjectId} storeId
 * @returns {Promise<Store>}
 */
const recoverStore = async(storeId) => {
  const store = await Store.findById(storeId);
  if (!store) {
    throw new ApiError("Store not found", 404);
  }
  store.status = "active";
  store.suspensionReason = null;
  await store.save({validateBeforeSave:false});
  return store;
}


const infoService = async(infoData)=>{
  let info = await Info.findOne({});
  if (!info) {
      info = new Info(infoData);
      await info.save();
  } else {
      info = await Info.findOneAndUpdate({}, infoData, { new: true });
  }
}


const getInfoService = async()=>{
  const info  = await Info.findOne({});
  if(!info){
    throw new ApiError("Info not found", 404);
  }
  return info;
}   




module.exports = {
  createUser,
  verifyUser,
  resendVerifyEmail,
  loginWithEmailAndPassword,
  forgetPasswordService,
  resetPasswordService,
  queryUsers,
  getUserById,
  getUserByEmail,
  updateUserByEmail,
  updateUser,
  updateUserById,
  deleteUserById,
  getUserByAddress,
  addArtworkToFavourites,
  removeArtworkFromFavourite,
  getFavouriteArtworks,
  
  followOtherUser,
  unFollowUser,
  getUserFollowers,
  getUserFollowing,
  removeArtwork,
  searchUsersByName,
  saveForgotPasswordCode,
  addCategories,
  paymentApprove,
  storeProductsBlacklist,
  removeProductFromBlacklist,
  getAllProductsFromBlacklist,
  storeSuspension,
  getAllSuspensionStores,
  recoverStore,
  infoService,
  getInfoService,
};
