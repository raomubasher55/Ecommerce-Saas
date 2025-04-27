const Order = require("../models/order.model");
const Store = require("../models/store.model");
const User = require('../models/user.model');
const ApiError = require("../utils/ApiError");
const { getSocket } = require("../utils/socket");

// Create Order Service
exports.createOrder = async (orderData) => {
  try {
      // Calculate Prices
      const itemsPrice = orderData.orderItems.reduce(
          (total, item) => total + (item.price * item.quantity),
          0
      );

      const taxPrice = itemsPrice * 0.18; // 18% tax
      const shippingPrice = itemsPrice > 1000 ? 0 : 100; // Free shipping over 1000
      const totalPrice = itemsPrice + taxPrice + shippingPrice;

      // Determine Order Status
      let orderStatus = "pending";
      let paidAt = null;

      if (orderData.paymentInfo.method !== "COD") {
          orderStatus = "processing"; 
      }

      // Prepare Order Data
      const finalOrderData = {
          ...orderData,
          itemsPrice,
          taxPrice,
          shippingPrice,
          totalPrice,
          orderStatus,
          paidAt,
      };

      // Create Order in Database
      const order = await Order.create(finalOrderData);

      // **Save Stripe Session ID if Online Payment**
      if (orderData.paymentInfo.method !== "COD" && orderData.paymentInfo.id) {
          order.paymentInfo.id = orderData.paymentInfo.id;
          await order.save({validateBeforeSave: false});
      }

      // **Update User Orders**
      if (order.user) {
          await User.findByIdAndUpdate(order.user, { $push: { orders: order._id } });
      }

      // **Update Store Orders**
      if (order.store) {
          await Store.findByIdAndUpdate(order.store, { $push: { orders: order._id } });
      }

      // **Emit Real-Time Update via Socket**
      const io = getSocket();
      if (io) {
          io.emit("new-order", {
              orderId: order._id,
              status: order.orderStatus,
          });
      }

      return order;
  } catch (error) {
      throw new ApiError(
          error.message || "Error creating order",
          error.statusCode || 500
      );
  }
};


exports.getUserOrders = async (userId) => {
  try {
    const orders = await Order.find({ user: userId }).populate("orderItems.product");
    return orders;
  } catch (error) {
    throw new Error("Error fetching user orders");
  }
};
exports.getOrderById = async (orderId) => {
  const order = await Order.findById(orderId)
    .populate("user")
    .populate("orderItems.product");
  if (!order) {
    throw new ApiError("Order not found.", 404);
  } 
  return order;
};


exports.getAllStoreOrders = async (store) => {
  if (!store || !store._id) {
    throw new ApiError("Invalid store information provided", 400);
  }

  // Check if the store exists in the database
  const storeExists = await Store.findById(store._id);
  if (!storeExists) {
    throw new ApiError("Store not found", 404);
  }

  const orders = await Order.find({ store: store._id })
    .populate("user")
    .populate("orderItems.product");

  if (!orders.length) {
    throw new ApiError("No orders found for this store", 404);
  }

  return orders;
};

// orderService.js
exports.getAllOrders = async () => {
    try {
        const orders = await Order.find();
        return orders;
    } catch (error) {
        throw new Error('Error fetching orders: ' + error.message);
    }
};


// Update Order Status
exports.updateOrderStatus = async (orderId, status) => {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new ApiError("Order not found.", 404);
  }

  const previousStatus = order.orderStatus;

  order.orderStatus = status;

  order.trackingDetails = {
    status: order.orderStatus, // New status
    updatedAt: Date.now(), // Timestamp of update
    previousStatus: previousStatus, // Optionally save the previous status for reference
  };

  // Save the updated order
  await order.save({validateBeforeSave: false});
  return order;
};

// Track Order
exports.trackOrder = async (orderId) => {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new ApiError("Order not found.", 404);
  }
  return order.trackingDetails;
};

exports.updatePaymentStatus = async (orderId, paymentStatus) => {
  const order = await Order.findById(orderId);
  if (!order) throw new ApiError("Order not found", 404);

    if (!["pending", "paid", "failed", "refunded"].includes(paymentStatus)) {
      throw new ApiError("Invalid payment status", 400);
    }

    order.paymentInfo.status = paymentStatus;
    order.paidAt = paymentStatus === "Paid" ? Date.now() : null;

    await order.save({validateBeforeSave: false});

    const io = getSocket();
    io.emit("payment-status-update", { orderId, paymentStatus });

    return order;
  
}; 

exports.updateTrackingDetails = async (orderId, trackingDetails) => {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new ApiError("Order not found.", 404);
  }

  if (order.orderStatus === "shipped" || order.orderStatus === "processing") {
    order.trackingDetails = {
      courier: trackingDetails.courier || "",
      trackingNumber: trackingDetails.trackingNumber || "",
      estimatedDelivery: trackingDetails.estimatedDelivery || null,
    };
    await order.save({validateBeforeSave: false});
    return order;
  } else {
    throw new ApiError(
      "Tracking details can only be updated for 'Shipped' or 'Processing' orders.",
      400
    );
  }
};

