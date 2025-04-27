const Store = require("../models/store.model");
const ApiError = require("../utils/ApiError");
const crypto = require("crypto");
const Products = require('../models/product.model')
const { sendVerificationEmail, sendPasswordResetEmail, sendReminderEmail } = require("./email.service");
const sendEmail = require("../utils/sendEmail");

/**
 * Create a new store
 * @param {Object} storeData - Store data
 * @returns {Promise<Store>}
 */
// const createStore = async (storeData) => {
//   if (await Store.isEmailTaken(storeData.email)) {
//     throw new ApiError("Email already taken", 401);
//   }

//   const store = await Store.create(storeData);

//   // Generate email verification token
//   const verificationToken = crypto.randomBytes(20).toString("hex");
//   store.verificationToken = verificationToken;
//   await store.save();

//   // Send verification email
//   await sendVerificationEmail(store.email, verificationToken);

//   return store;
// };

const createStore = async (storeData) => {

  if (!storeData.name || typeof storeData.name !== 'string' || storeData.name.trim() === '') {
    throw new ApiError('Store name is required and must be a valid string', 400);
  }

  if (storeData.name.length > 50) {
    throw new ApiError('Store name cannot exceed 50 characters', 400);
  }

  if (!storeData.description || typeof storeData.description !== 'string' || storeData.description.trim() === '') {
    throw new ApiError('Store description is required and must be a valid string', 400);
  }

  if (storeData.description.length > 500) {
    throw new ApiError('Store description cannot exceed 500 characters', 400);
  }

  if (!storeData.address || typeof storeData.address !== 'string' || storeData.address.trim() === '') {
    throw new ApiError('Store address is required and must be a valid string', 400);
  }

  if (!storeData.location || typeof storeData.location !== 'string' || storeData.location.trim() === '') {
    throw new ApiError('Store location is required and must be a valid string', 400);
  }

  if (!storeData.phone || typeof storeData.phone !== 'string' || storeData.phone.trim() === '') {
    throw new ApiError('Store phone number is required and must be a valid string', 400);
  }



  if (!storeData.email || typeof storeData.email !== 'string' || storeData.email.trim() === '') {
    throw new ApiError('Store email is required and must be a valid string', 400);
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(storeData.email)) {
    throw new ApiError('Please enter a valid email address', 400);
  }

  if (!storeData.ownerFullName || typeof storeData.ownerFullName !== 'string' || storeData.ownerFullName.trim() === '') {
    throw new ApiError('Owner full name is required and must be a valid string', 400);
  }

  if (storeData.ownerFullName.length > 100) {
    throw new ApiError('Owner full name cannot exceed 100 characters', 400);
  }

  if (!storeData.nationality || typeof storeData.nationality !== 'string' || storeData.nationality.trim() === '') {
    throw new ApiError('Nationality is required and must be a valid string', 400);
  }

  if (storeData.nationality.length > 50) {
    throw new ApiError('Nationality cannot exceed 50 characters', 400);
  }

  if (await Store.isEmailTaken(storeData.email)) {
    throw new ApiError("Email already taken", 401);
  }

  if (await Store.isPhoneTaken(storeData.phone)) {
    throw new ApiError("Phone number already taken", 401);
  }

  const store = await Store.create(storeData);

  // Generate email verification token
  const verificationToken = crypto.randomBytes(20).toString("hex");
  store.verificationToken = verificationToken;
  await store.save({validateBeforeSave: false});

  // Send verification email
  await sendVerificationEmail(store.email, verificationToken);

  return store;
};

/**
 * Verify email
 * @param {string} token - Verification token
 * @returns {Promise<Store>}
 */
const verifyEmail = async (token) => {
  const store = await Store.findOne({ verificationToken: token });
  if (!store) {
    throw new ApiError("Invalid or expired verification token", 400);
  }
  store.emailVerified = true;
  store.verificationToken = undefined;
  await store.save({ validateBeforeSave: false });
  return store;
};
/**
 * Get store by email and password
 * @param {string} email - Store email
 * @param {string} password - Store password
 * @returns {Promise<Store>}
 */
const loginWithEmailAndPassword = async (email, password) => {
  const store = await Store.findOne({ email }).select("+password");
  if (!store || !(await store.comparePassword(password))) {
    throw new ApiError("Incorrect email or password", 401);
  }
  return store;
};

/**
 * Get store by ID
 * @param {string} storeId - Store ID
 * @returns {Promise<Store>}
 */
const getStoreById = async (storeId) => {
  const store = await Store.findById(storeId);
  if (!store) {
    throw new ApiError("Store not found", 404);
  }
  return store;
};

/**
 * Get all stores with pagination
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @returns {Promise<QueryResult>}
 */
const getAllStores = async (filter = {}, options) => {
  // Ensure only active stores are fetched
  const activeFilter = { ...filter, status: 'active' };

  const stores = await Store.paginate(activeFilter, options);
  return stores;
};


/**
 * Update a store by ID
 * @param {string} storeId - Store ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Store>}
 */
const updateStoreById = async (storeId, updateData) => {
  const store = await Store.findByIdAndUpdate(storeId, updateData, {
    new: true,
    runValidators: true,
  });
  if (!store) {
    throw new ApiError("Store not found", 404);
  }
  return store;
};

/**
 * Delete a store by ID
 * @param {string} storeId - Store ID
 * @returns {Promise<void>}
 */
const deleteStoreById = async (storeId) => {
  const store = await Store.findByIdAndDelete(storeId);
  if (!store) {
    throw new ApiError("Store not found", 404);
  }
  return;
};

/**
 * Forgot password
 * @param {string} email
 * @param {string} protocol
 * @param {string} host
 * @returns {Promise<void>}
 */
const forgetPasswordService = async (email, protocol, host) => {
  const store = await Store.findOne({ email });

  if (!store) {
    throw new ApiError("Store not found", 404);
  }

  const resetToken = store.getResetPasswordToken();
  await store.save({ validateBeforeSave: false });

  try {
    await sendPasswordResetEmail(store.email, resetToken, host, protocol);
  } catch (error) {
    Store.resetPasswordToken = undefined;
    store.resetPasswordExpires = undefined;
    await store.save({ validateBeforeSave: false });
    throw new ApiError("Email could not be sent", 500);
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

  const store = await Store.findOne({
    resetPasswordToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!store) {
    throw new ApiError('Invalid token or token is expired', 400);
  }

  if (password !== confirmPassword) {
    throw new ApiError('Passwords do not match', 400);
  }

  store.password = password;
  store.resetPasswordToken = undefined;
  store.resetPasswordExpires = undefined;
  await store.save({ validateBeforeSave: false });
};



const paymentWithdraw = async (storeId, amount) => {
  const store = await Store.findById(storeId);
  if (!store) {
    throw new ApiError("Store not found", 404);
  }
  const uniqueId = crypto.randomBytes(16).toString('hex');
  if(amount <= 100) {
    throw new ApiError("Amount must be greater than 100", 400);
  }
  if (store.totalSales < amount) {
    throw new ApiError("Insufficient balance", 400);
  }
  try {
    store.withdraw.push({
      id: uniqueId,
      amount: amount,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    store.totalSales = store.totalSales - amount;
    await store.save({ validateBeforeSave: false });
    return { message: "Payment will be processed in 3-5 business days", uniqueId };
  } catch (error) {
    store.totalSales = store.totalSales + amount; // Rollback if save fails
    await store.save({ validateBeforeSave: false });
    console.log(error);
    throw new ApiError("Error processing withdrawal", 500);
  }
};

const paymentDetails = async (storeId, cardNumber , holderName , expiryDate, cvc, cardType) => {
  const store = await Store.findById(storeId);
  if (!store) {
    throw new ApiError("Store not found", 404);
  }
  store.paymentDetails = {
    cardNumber,
    holderName,
    expiryDate,
    cvc,
    cardType,
  };
  await store.save({ validateBeforeSave: false });
  return { message: "Payment details updated successfully" };
};

const getAllProductsFromBlacklist = async (storeId) => {
  const store = await Store.findById(storeId);
  if (!store) {
    throw new ApiError("Store not found", 404);
  }
  const productIds = store.productsBlacklist;
  const products = await Products.find({ _id: { $in: productIds } });

  return products; 
};


const reminderEmail = async (email) => {
  const store = await Store.findOne({ email });
  if (!store) {
    throw new ApiError("Store not found", 404);
  }
  await sendReminderEmail(store.email);
  return { message: "Reminder email sent successfully" };
};

/**
 * Suspend a store
 * @param {string} storeId - Store ID
 * @param {string} reason - Suspension reason
 * @returns {Promise<Store>}
 */
const suspendStore = async (storeId, reason) => {
  const store = await Store.findById(storeId);
  if (!store) {
    throw new ApiError("Store not found", 404);
  }

  if (store.status === "suspended") {
    throw new ApiError("Store is already suspended", 400);
  }

  store.status = "suspended";
  store.suspensionReason = reason;
  await store.save({ validateBeforeSave: false });

  // Send email notification to store owner
  try {
    await sendEmail({
      to: store.email,
      subject: "Store Account Suspended",
      text: `Dear ${store.ownerFullName},

Your store "${store.name}" has been suspended.

Reason for suspension: ${reason}

If you believe this is a mistake or would like to appeal this decision, please contact our support team.

Best regards,
Admin Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #dc3545; margin-bottom: 10px;">Account Suspended</h2>
            <p style="color: #6c757d; font-size: 16px;">Important Notice Regarding Your Store</p>
          </div>
          
          <div style="background-color: white; padding: 25px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <p style="color: #333; font-size: 16px; margin-bottom: 20px;">Dear ${store.ownerFullName},</p>
            
            <p style="color: #333; font-size: 16px; margin-bottom: 15px;">
              We regret to inform you that your store "<strong>${store.name}</strong>" has been suspended.
            </p>
            
            <div style="background-color: #fff3f3; padding: 15px; border-left: 4px solid #dc3545; margin: 20px 0;">
              <p style="color: #333; font-size: 16px; margin: 0;">
                <strong>Reason for suspension:</strong><br>
                ${reason}
              </p>
            </div>
            
            <p style="color: #333; font-size: 16px; margin-bottom: 20px;">
              If you believe this is a mistake or would like to appeal this decision, please contact our support team.
            </p>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
              <p style="color: #6c757d; font-size: 14px; margin: 0;">
                Best regards,<br>
                <strong>Admin Team</strong>
              </p>
            </div>
          </div>
        </div>
      `
    });
  } catch (error) {
    console.error("Failed to send suspension email:", error);
  }

  return store;
};

/**
 * Recover a suspended store
 * @param {string} storeId - Store ID
 * @returns {Promise<Store>}
 */
const recoverStore = async (storeId) => {
  const store = await Store.findById(storeId);
  if (!store) {
    throw new ApiError("Store not found", 404);
  }

  if (store.status !== "suspended") {
    throw new ApiError("Store is not suspended", 400);
  }

  store.status = "active";
  store.suspensionReason = null;
  await store.save({ validateBeforeSave: false });

  // Send email notification to store owner
  try {
    await sendEmail({
      to: store.email,
      subject: "Store Account Recovered",
      text: `Dear ${store.ownerFullName},

Your store "${store.name}" has been reactivated and is now fully operational.

You can now log in and resume your business activities.

Thank you for your patience.

Best regards,
Admin Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #28a745; margin-bottom: 10px;">Account Reactivated!</h2>
            <p style="color: #6c757d; font-size: 16px;">Your store is now back in business</p>
          </div>
          
          <div style="background-color: white; padding: 25px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <p style="color: #333; font-size: 16px; margin-bottom: 20px;">Dear ${store.ownerFullName},</p>
            
            <p style="color: #333; font-size: 16px; margin-bottom: 20px;">
              We are pleased to inform you that your store <strong>"${store.name}"</strong> has been reactivated and is now fully operational.
            </p>
            
            <div style="background-color: #e8f5e9; padding: 15px; border-radius: 4px; margin: 20px 0;">
              <p style="color: #2e7d32; margin: 0; font-size: 16px;">
                You can now log in and resume your business activities.
              </p>
            </div>
            
            <p style="color: #333; font-size: 16px; margin-bottom: 20px;">
              Thank you for your patience during this process.
            </p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
              <p style="color: #6c757d; margin: 0; font-size: 14px;">Best regards,</p>
              <p style="color: #6c757d; margin: 0; font-size: 14px;">Admin Team</p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 30px; color: #6c757d; font-size: 12px;">
            <p>© ${new Date().getFullYear()} Your Company Name. All rights reserved.</p>
          </div>
        </div>
      `
    });
  } catch (error) {
    console.error("Failed to send recovery email:", error);
  }

  return store;
};

/**
 * Get all suspended stores
 * @returns {Promise<Store[]>}
 */
const getSuspendedStores = async () => {
  const stores = await Store.find({ status: "suspended" })
    .select('name email ownerFullName status suspensionReason createdAt');
  return stores;
};

module.exports = {
  createStore,
  getStoreById,
  getAllStores,
  updateStoreById,
  deleteStoreById,
  loginWithEmailAndPassword,
  forgetPasswordService,
  resetPasswordService,
  paymentWithdraw,
  paymentDetails, 
  getAllProductsFromBlacklist,
  verifyEmail,
  reminderEmail,
  suspendStore,
  recoverStore,
  getSuspendedStores
};
