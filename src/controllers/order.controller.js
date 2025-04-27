const catchAsyncErrors = require("../middlewares/catchAsyncErrors.middleware");
const Order = require("../models/order.model");
const orderService = require("../services/order.service");
const ApiError = require("../utils/ApiError");
const axios = require('axios');
const Store = require("../models/store.model");


exports.createOrder = catchAsyncErrors(async (req, res, next) => {
  try {
    const { shippingInfo, orderItems, paymentInfo = {} } = req.body;

    if (!paymentInfo.method) {
      return next(new ApiError("Payment method is required", 400));
    }

    // Group order items by store (seller)
    const storeOrders = orderItems.reduce((acc, item) => {
      const storeId = item.seller;
      if (!storeId) throw new ApiError("Missing seller information in order items", 400);
   
      if (!acc[storeId]) {
        acc[storeId] = {
          orderItems: [],
          totalAmount: 0
        }; 
      }

      acc[storeId].orderItems.push(item);
      acc[storeId].totalAmount += Number(item.price) * Number(item.quantity);
      return acc;
    }, {});

    // Calculate total amount for all stores
    const totalAmount = Object.values(storeOrders).reduce((sum, store) => sum + store.totalAmount, 0);
    const formattedAmount = Math.round(totalAmount * 100);
    const mainOrderNumber = `ORDER_${Date.now()}`;

    if (paymentInfo.method.toUpperCase() === "ONLINE") {
      // Single payment request for all stores
      const response = await axios({
        method: 'get',
        url: 'https://test.satim.dz/payment/rest/register.do',
        params: {
          userName: process.env.SATIM_USERNAME,
          password: process.env.SATIM_PASSWORD,
          orderNumber: mainOrderNumber,
          amount: formattedAmount,
          currency: '012',
          language: 'fr',
          returnUrl: `${process.env.FRONTEND_URL}/success`,
          failUrl: `${process.env.FRONTEND_URL}/cancel`,
          jsonParams: JSON.stringify({
            force_terminal_id: process.env.SATIM_TERMINAL_ID,
            udf1: mainOrderNumber,
            udf5: Math.random().toString(36).substring(7)
          }),
          pageView: 'DESKTOP',
          sessionTimeoutSecs: 600
        },
        headers: {
          'Accept': '*/*',
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0',
          'Connection': 'keep-alive'
        },
        timeout: 30000,
        validateStatus: false
      });

      if (response.data.errorCode !== '0') {
        throw new ApiError(response.data.errorMessage, 400);
      }

      // Create all store orders with same payment ID
      const orders = await Promise.all(
        Object.entries(storeOrders).map(async ([storeId, storeOrder]) => {
          return Order.create({
            user: req.user._id,
            store: storeId,
            orderNumber: `${mainOrderNumber}-${storeId}`,
            shippingInfo,
            orderItems: storeOrder.orderItems,
            paymentInfo: {
              id: response.data.orderId,
              status: 'pending',
              method: 'Online'
            },
            itemsPrice: storeOrder.totalAmount,
            shippingPrice: 0,
            taxPrice: 0,
            totalPrice: storeOrder.totalAmount
          });
        })
      );

      return res.status(200).json({
        success: true,
        data: {
          paymentUrl: response.data.formUrl,
          paymentId: response.data.orderId,
          mainOrderNumber,
          storeOrders: Object.keys(storeOrders)
        }
      });
    }

    // Handle COD orders
    if (paymentInfo.method.toUpperCase() === "COD") {
      const orders = await Promise.all(
        Object.entries(storeOrders).map(async ([storeId, storeOrder]) => {
          return Order.create({
            user: req.user._id,
            store: storeId,
            shippingInfo,
            orderItems: storeOrder.orderItems,
            paymentInfo: {
              id: null,
              status: 'pending',
              method: 'COD'
            },
            itemsPrice: storeOrder.totalAmount,
            shippingPrice: 0,
            taxPrice: 0,
            totalPrice: storeOrder.totalAmount
          });
        })
      );

      return res.status(201).json({
        success: true,
        orders
      });
    }

  } catch (error) {
    return next(new ApiError(error.message, 500));
  }
});




exports.confirmPayment = catchAsyncErrors(async (req, res, next) => {
  try {
    const { orderId } = req.params;

    // Check payment status with SATIM
    const response = await axios({
      method: 'get',
      url: 'https://test.satim.dz/payment/rest/getOrderStatus.do',
      params: {
        userName: process.env.SATIM_USERNAME,
        password: process.env.SATIM_PASSWORD,
        orderId: orderId
      }
    });

    // Map SATIM status to order status
    let paymentStatus = 'pending';
    if (response.data.OrderStatus === 2) {
      paymentStatus = 'paid';

      // Update ALL orders with this payment ID
      const orders = await Order.updateMany(
        { "paymentInfo.id": orderId },
        {
          $set: {
            "paymentInfo.status": 'paid',
            orderStatus: 'processing',
            paidAt: new Date()
          }
        }
      );

      // Update store sales for each affected order
      const ordersWithStores = await Order.find({ "paymentInfo.id": orderId });
      const storeUpdates = ordersWithStores.map(async (order) => {
        const salesAmount = order.totalPrice || 0;

        await Store.findByIdAndUpdate(
          order.store,
          { $inc: { totalSales: salesAmount } },
          { new: true }
        );
      });

      await Promise.all(storeUpdates);

    } else if (response.data.OrderStatus === 6) {
      paymentStatus = 'failed';

      // Update all orders with failed status
      await Order.updateMany(
        { "paymentInfo.id": orderId },
        {
          $set: {
            "paymentInfo.status": 'failed',
            orderStatus: 'cancelled'
          }
        }
      );
    }

    // Get updated orders for response
    const updatedOrders = await Order.find({ "paymentInfo.id": orderId });

    res.status(200).json({
      success: true,
      paymentStatus,
      orders: updatedOrders,
      satimResponse: response.data
    });

  } catch (error) {
    console.error('Payment confirmation error:', error);
    return next(new ApiError(
      error.response?.data?.errorMessage || "Payment confirmation failed",
      error.response?.status || 500
    ));
  }
});

exports.updateOnlineOrderStatus = catchAsyncErrors(async (req, res, next) => {
  const { sessionId, orderId, status } = req.body;

  if (!orderId || !status) {
    return next(new ApiError("Missing required parameters", 400));
  }

  try {
    const order = await Order.findById(orderId);
    if (!order) return next(new ApiError("Order not found", 404));



    // Update order status
    order.status = status;
    order.paymentInfo.status = status;
    if (status === "paid") {
      order.paidAt = new Date();
    }
    await order.save({validateBeforeSave: false});

    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      order,
    });

  } catch (error) {
    return next(new ApiError(`Error updating order: ${error.message}`, 500));
  }
});


// Get single order
exports.getSingleOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );

  if (!order) {
    return next(new ApiError("Order not found", 404));
  }

  res.status(200).json({
    success: true,
    order,
  });
});

// Get logged in user orders
exports.myOrders = catchAsyncErrors(async (req, res, next) => {
  const orders = await Order.find({ user: req.user._id });

  res.status(200).json({
    success: true,
    orders,
  });
});

exports.getUserOrders = async (req, res, next) => {
  console.log(req.user)
  try {
    // Get orders using the service method
    const orders = await orderService.getUserOrders(req.user._id);

    // If no orders found, return a 404 response
    if (!orders || orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No orders found for this user",
      });
    }

    // Return the orders in the response
    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

exports.updatePaymentStatus = catchAsyncErrors(async (req, res, next) => {
  const { paymentStatus } = req.body;
  const { id } = req.params;
  const order = await orderService.updatePaymentStatus(id, paymentStatus);
  res.status(200).json({
    success: true,
    message: `Payment status for Order ID: ${id} updated to ${paymentStatus}`,
    order,
  });
});

// Get Order by ID
exports.getOrderById = catchAsyncErrors(async (req, res, next) => {
  const order = await orderService.getOrderById(req.params.id);

  res.status(200).json({
    success: true,
    order,
  });
});

// Update Order Status
exports.updateOrderStatus = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;


  const paymentStatus = status === "delivered" ? "paid" : "pending";
  const order = await Order.findById(id);
  if (!order) {
    return next(new ApiError("Order not found", 404));
  }

  if (status === "delivered" && order.orderStatus === "delivered") {
    return next(new ApiError("Order already delivered", 400));
  }

  await order.updateOne({
    orderStatus: status,
    "paymentInfo.status": paymentStatus
  });

  if (order.store && status === "delivered") {
    const updatedStore = await Store.findOneAndUpdate(
      { _id: order.store },
      { $inc: { totalSales: order.totalPrice } },
      { upsert: false, new: true }
    );
    if (!updatedStore) {
      return next(new ApiError("Store not found", 404));
    }
  }

  const updatedOrder = await Order.findById(id); // Fetch updated order
  res.status(200).json({
    success: true,
    data: { order: updatedOrder }
  });
});

// Get All Orders store
exports.getAllStoreOrders = catchAsyncErrors(async (req, res, next) => {
  const orders = await orderService.getAllStoreOrders(req.store);

  res.status(200).json({
    success: true,
    orders,
  });
});

// Track Order
exports.trackOrder = catchAsyncErrors(async (req, res, next) => {
  const trackingDetails = await orderService.trackOrder(req.params.id);

  res.status(200).json({
    success: true,
    trackingDetails,
  });
});

exports.updateTrackingDetails = catchAsyncErrors(async (req, res, next) => {
  const { trackingDetails } = req.body;
  const order = await orderService.updateTrackingDetails(req.params.id, trackingDetails);
  res.status(200).json({
    success: true,
    message: "Tracking details updated successfully.",
    order,
  });
});

exports.allOrders = catchAsyncErrors(async (req, res) => {
  try {
    const orders = await orderService.getAllOrders();
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

exports.getOrderByPaymentId = catchAsyncErrors(async (req, res, next) => {
  const { paymentId } = req.query;

  const order = await Order.findOne({ "paymentInfo.id": paymentId });

  if (!order) {
    return next(new ApiError("Order not found", 404));
  }

  res.status(200).json({
    success: true,
    order
  });
}); 