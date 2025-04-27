const storeService = require("../services/store.service");
const ApiError = require("../utils/ApiError");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors.middleware");
const Store = require('../models/store.model');
const sendToken = require("../utils/jwtToken");
const Order = require('../models/order.model');
const mongoose = require('mongoose');
const Card = require('../models/card.model')
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');


exports.createStore = catchAsyncErrors(async (req, res, next) => {
  const storeData = req.body;

  if (req.file) {
    storeData.photo = {
      public_id: req.file.filename,
      url: `/uploads/images/${req.file.filename}`,
    };
  }

  const store = await storeService.createStore(storeData);
  sendToken(store, 201, res);
});


/**
 * Controller to verify email with token
 */
exports.verifyEmail = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.params;
  await storeService.verifyEmail(token);
  res.status(200).json({ message: 'Email verified successfully!',});
});

exports.loginStore = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new ApiError("Please enter email and password", 400));
  }
  const store = await storeService.loginWithEmailAndPassword(email, password);
  res.cookie("token", store.token);
  sendToken(store, 200, res);
});


exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
  await storeService.forgetPasswordService(req.body.email, req.protocol, req.get("host"));
  res.status(200).json({
    message: `Email sent to: ${req.body.email}`,
  });
});



exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.params; 
  const { password, confirmPassword } = req.body; 
  await storeService.resetPasswordService(token, password, confirmPassword);
  res.status(200).json({
      message: 'Password has been reset successfully',
  }); 
});


/**
 * Controller to get a store by ID
 */
exports.getStoreById = catchAsyncErrors(async (req, res, next) => {
  const storeId = req.store._id;
  const store = await storeService.getStoreById(storeId);
  res.status(200).json({store});
});
exports.StoreById = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const store = await storeService.getStoreById(id);
  res.status(200).json({store});
});

/**
 * Controller to get all stores with pagination
 */
exports.getAllStores = catchAsyncErrors(async (req, res, next) => {
  const { page, limit, sortBy } = req.query;
  const filter = {}; // Apply filters based on requirements
  const options = {
    page: page || 1,
    limit: limit || 100000,
    sort: sortBy || "-createdAt",
  };
  const stores = await storeService.getAllStores(filter, options);
  res.status(200).json({
    success: true,
    stores,
  });
});

/**
 * Controller to update a store
 */
exports.updateStore = catchAsyncErrors(async (req, res, next) => {
  const storeId = req.params.storeId || req.store._id;
  const updateData = req.body;
  const updatedStore = await storeService.updateStoreById(storeId, updateData);
  res.status(200).json({
    success: true,
    message: "Store updated successfully",
    store: updatedStore,
  });
});

/**
 * Controller to delete a store
 */
exports.deleteStoreById = catchAsyncErrors(async (req, res, next) => {
  const storeId = req.params.storeId;
  await storeService.deleteStoreById(storeId);
  res.status(200).json({
    success: true,
    message: "Store deleted successfully",
  });
});



/**
 * controller to logout a store
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 */
exports.logoutStore = catchAsyncErrors(async (req, res, next) => {
    const token = req.cookies.token || req.header("Authorization").replace("Bearer ", "");
    if (!token) {
        return next(new ApiError("No token provided", 401));
    }
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
    });
    res.status(201).json({
        message: "Logged out successfully",
    });
    }
);

/**
 * controller to send reminder email
 */
exports.reminderEmail = catchAsyncErrors(async (req, res) => {
  const { email } = req.body;
  await storeService.reminderEmail(email);
  res.status(200).json({message: "Reminder email sent successfully"});
});

// Add this function to calculate total sales for a store
exports.calculateStoreSales = catchAsyncErrors(async (req, res) => {
  try {
    const storeId = req.params.id;

    const monthlySales = await Order.aggregate([
      {
        $match: {
          'orderItems.store': new mongoose.Types.ObjectId(storeId),
          orderStatus: 'Delivered', 
        }
      },
      {
        $unwind: '$orderItems', 
      },
      {
        $match: {
          'orderItems.store': new mongoose.Types.ObjectId(storeId)
        }
      },
      {
        $project: {
          year: { $year: '$createdAt' }, 
          month: { $month: '$createdAt' }, 
          price: '$orderItems.price', 
        }
      },
      {
        $group: {
          _id: { year: '$year', month: '$month' }, 
          totalAmount: { $sum: '$price' }, 
          totalOrders: { $addToSet: '$_id' },
          totalProducts: { $sum: 1 } 
        }
      },
      {
        $project: {
          _id: 0,
          year: '$_id.year',
          month: '$_id.month',
          totalAmount: 1,
          totalOrders: { $size: '$totalOrders' },
          totalProducts: 1
        }
      },
      {
        $sort: { year: 1, month: 1 }
      }
    ]);

    if (!monthlySales || monthlySales.length === 0) {
      return res.status(200).json({
        success: true,
        data: []
      });
    }

    res.status(200).json({
      success: true,
      data: monthlySales
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error calculating store sales",
      error: error.message
    });
  }
});



exports.CardDetail = catchAsyncErrors(async (req, res) => {
  const { holderName, cardNumber, expiryDate, cvc, cardType } = req.body;

  if (!holderName || !cardNumber || !expiryDate || !cvc || !cardType) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const newCard = new Card({
      storeId: req.store._id, 
      holderName,
      cardNumber,
      expiryDate,
      cvc,
      cardType,
    });

    await newCard.save({validateBeforeSave: false});
    res.status(201).json({ message: "Payment saved successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


exports.StoreCard = catchAsyncErrors(async (req, res) => {
  try {
      const storeId = req.store._id;
      const cards = await Card.find({ storeId });
      
      if (!cards.length) {
        return res.status(404).json({ message: "No stored cards found." });
      }
      
      // 🔓 Decrypt all cards before sending response
      const decryptedCards = cards.map(card => card.decryptCard());

      res.status(200).json({ cards: decryptedCards });
  } catch (error) {
      console.error("Error fetching stored cards:", error);
      res.status(500).json({ message: "Internal Server Error" });
  }
});


// 🔥 Get All Store Cards with Decryption
exports.AllStoreCards = async (req, res) => {
  try {
    const cards = await Card.find().populate("storeId", "name email phone"); 

    // Decrypt card details
    const decryptedCards = cards.map((card) => {
      const decryptedCard = card.decryptCard();
      return {
        ...decryptedCard,
        store: card.storeId, // Include store details
      };
    });

    res.status(200).json({
      success: true,
      count: decryptedCards.length,
      cards: decryptedCards,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.paymentWithdraw = catchAsyncErrors(async (req, res) => {
  const { amount } = req.body;
  const storeId = req.store._id;
  const response = await storeService.paymentWithdraw(storeId, amount);
  res.status(200).json(response);
});

// Get all withdrawals for admin
exports.getAllWithdrawals = catchAsyncErrors(async (req, res) => {
  const stores = await Store.find({ 'withdraw.status': 'pending' })
    .select('name email withdraw paymentDetails');
  
  const withdrawals = stores.flatMap(store => 
    store.withdraw.map(w => ({
      ...w.toObject(),
      store: {
        _id: store._id,
        name: store.name,
        email: store.email,
        paymentDetails: store.paymentDetails
      }
    }))
  );

  res.status(200).json({
    success: true,
    withdrawals
  });
});

// Approve withdrawal
exports.approveWithdrawal = catchAsyncErrors(async (req, res) => {
  const { storeId } = req.body;
  const { withdrawalId } = req.params;

  const store = await Store.findById(storeId);
  if (!store) {
    return res.status(404).json({ message: "Store not found" });
  }

  const withdrawal = store.withdraw.id(withdrawalId);
  if (!withdrawal) {
    return res.status(404).json({ message: "Withdrawal not found" });
  }

  withdrawal.status = 'completed';
  withdrawal.updatedAt = new Date();
  store.earnings = store.earnings + withdrawal.amount;
  await store.save({ validateBeforeSave: false });

  // Add email validation and error handling
  if (!store.email) {
    console.error('No email found for store:', store._id);
    return res.status(200).json({
      success: true,
      message: "Withdrawal approved but failed to send email notification"
    });
  }

  try {
    await sendEmail({
      to: store.email,  // Ensure this is populated
      subject: "Withdrawal Approved",
      text: `Dear Valued Store Partner,

We are pleased to inform you that your withdrawal request has been successfully approved.

Withdrawal Details:
- Amount: ${withdrawal.amount}
- Status: Approved
- Date: ${new Date().toLocaleDateString()}

The funds have been processed and will be transferred to your registered account. Please allow 2-3 business days for the amount to reflect in your account.

If you have any questions or concerns about this withdrawal, please don't hesitate to contact our support team.

Thank you for your continued partnership.

Best regards,
The Support Team`,
    });
  } catch (emailError) {
    console.error('Failed to send approval email:', emailError);
  }

  res.status(200).json({
    success: true,
    message: "Withdrawal approved successfully"
  });
});

exports.paymentDetails = catchAsyncErrors(async (req, res) => {
  const {cardNumber , holderName , expiryDate, cvc, cardType} = req.body;
  const storeId = req.store._id;
  const response = await storeService.paymentDetails(storeId, cardNumber , holderName , expiryDate, cvc, cardType);
  res.status(200).json(response);
});


exports.getAllProductsFromBlacklist = catchAsyncErrors(async (req, res) => {
  const storeId = req.store._id;
  const response = await storeService.getAllProductsFromBlacklist(storeId);
  res.status(200).json(response);
});

/**
 * Suspend a store
 */
exports.suspendStore = catchAsyncErrors(async (req, res) => {
  const { storeId } = req.params;
  const { reason } = req.body;

  if (!reason) {
    throw new ApiError("Suspension reason is required", 400);
  }

  const store = await storeService.suspendStore(storeId, reason);

  res.status(200).json({
    success: true,
    message: "Store suspended successfully",
    store: {
      id: store._id,
      name: store.name,
      status: store.status,
      suspensionReason: store.suspensionReason
    }
  });
});

/**
 * Recover a suspended store
 */
exports.recoverStore = catchAsyncErrors(async (req, res) => {
  const { storeId } = req.params;
  const store = await storeService.recoverStore(storeId);

  res.status(200).json({
    success: true,
    message: "Store recovered successfully",
    store: {
      id: store._id,
      name: store.name,
      status: store.status
    }
  });
});

/**
 * Get all suspended stores
 */
exports.getSuspendedStores = catchAsyncErrors(async (req, res) => {
  const stores = await storeService.getSuspendedStores();

  res.status(200).json({
    success: true,
    count: stores.length,
    stores
  });
});



exports.getMonthlyRevenue = async (req, res) => {
  try {
    const orders = await Order.find({ paymentInfo: { status: 'paid' } });

    // Group by month
    const monthlyRevenue = Array(12).fill(0); // Jan to Dec

    orders.forEach(order => {
      const month = new Date(order.createdAt).getMonth(); // 0 (Jan) - 11 (Dec)
      monthlyRevenue[month] += order.totalPrice;
    });

    res.status(200).json({ success: true, data: monthlyRevenue });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
