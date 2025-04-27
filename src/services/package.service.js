const Package = require("../models/Package.model.js");
const Store  = require('../models/store.model.js');
const User = require("../models/user.model.js");
const ApiError = require("../utils/ApiError.js");
const Subscription = require('../models/subscription.js');
const axios = require("axios");

const packageData = {
  Starter: {
    name: "Starter",
    price: 800,
    features: {
      productLimit: 3,
      support: "Basic Email Support",
      analytics: "Basic Analytics",
      paymentGateways: "Standard Gateways",
      marketingTools: false,
      globalReach: false,
      referralProgram: false,
      transactionLimits: "Up to 800 DZD/month",
    },
  },
  Classic: {
    name: "Classic",
    price: 1500,
    features: {
      productLimit: 6,
      support: "Priority Email Support",
      analytics: "Advanced Analytics",
      paymentGateways: "Standard + Premium Gateways",
      marketingTools: true,
      globalReach: true,
      referralProgram: false,
      transactionLimits: "Up to 1500 DZD/month",
    },
  },
  Growth: {
    name: "Growth",
    price: 2400,
    features: {
      productLimit: 10,
      support: "24/7 Support",
      analytics: "Full Analytics Suite",
      paymentGateways: "All Gateways + Custom Integrations",
      marketingTools: true,
      globalReach: true,
      referralProgram: true,
      transactionLimits: "Up to 2400 DZD/month",
    },
  },
  Enterprise: {
    name: "Enterprise",
    price: 15000,
    features: {
      productLimit: 500,
      support: "Dedicated Account Manager",
      analytics: "Custom Analytics and Reporting",
      paymentGateways: "All Gateways + Custom Integrations",
      marketingTools: true,
      globalReach: true,
      referralProgram: true,
      transactionLimits: "Unlimited",
    },
  },
};

const createPackageAndProcessPayment = async (store, packageType, paymentMethod) => {

  // const packageData = await Subscription.find();
  // console.log("packge" , packageType);

  // Validate store and required parameters
  // if (!packageType || !packageData[packageType]) {
  //     throw new ApiError("Invalid package type", 400);
  // }


  // const selectedPackage = packageData[packageType];


  const fetchedPackageData = await Subscription.find(); 
  const normalizedPackageType = packageType.trim();
  const selectedPackage = fetchedPackageData.find(pkg => pkg.name === normalizedPackageType);

  if (!selectedPackage) {
      throw new ApiError("Invalid package type", 400);
  }



  let newPackage;
  try {
    const { _id, ...selectedPackageData } = selectedPackage._doc || selectedPackage; // safely remove _id

    if (store.package && store.package.id) {
        newPackage = await Package.findByIdAndUpdate(
            store.package.id,
            {
                ...selectedPackageData,
                isActive: false,
                status: 'pending'
            },
            { new: true }
        );
    } else {
        newPackage = await Package.create({
            seller: store._id,
            isActive: false,
            status: 'pending',
            ...selectedPackageData,
        });
    }
    
      
      // Payment processing logic
      if (paymentMethod.toUpperCase() === "CARD") {
          const formattedAmount = Math.round(selectedPackage.price * 100);
          const orderNumber = `PKG_${Date.now()}`;

          try {
              const url = 'https://test.satim.dz/payment/rest/register.do';
              const jsonParams = JSON.stringify({
                  force_terminal_id: process.env.SATIM_TERMINAL_ID,
                  udf1: orderNumber,
                  udf5: Math.random().toString(36).substring(7)
              });

              const response = await axios({
                  method: 'get',
                  url: url,
                  params: {
                      userName: process.env.SATIM_USERNAME,
                      password: process.env.SATIM_PASSWORD,
                      orderNumber: orderNumber,
                      amount: formattedAmount,
                      currency: '012',
                      language: 'fr',
                      returnUrl: `${process.env.FRONTEND_URL}/package/success`,
                      failUrl: `${process.env.FRONTEND_URL}/package/failed`,
                      jsonParams: jsonParams,
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
                  // Update package status instead of deleting
                  await Package.findByIdAndUpdate(newPackage._id, { status: 'failed' });
                  throw new ApiError(response.data.errorMessage || "Payment gateway error", 400);
              }

              // Update store's package info - Use validateBeforeSave: false to bypass validation
              store.package = {
                  id: newPackage._id,
                  name: newPackage.name,
                  expiresAt: new Date(new Date().setMonth(new Date().getMonth() + 1)),
                  paymentMethod: paymentMethod,
                  paymentId: response.data.orderId,
                  orderNumber: orderNumber,
                  status: 'pending' 
              };

              // Use validateBeforeSave: false to bypass validation
              await store.save({ validateBeforeSave: false });

              return {
                  success: true,
                  data: {
                      paymentUrl: response.data.formUrl,
                      orderId: response.data.orderId,
                      orderNumber: orderNumber,
                      packageId: newPackage._id,
                      message: "Payment session created successfully"
                  }
              };

          } catch (error) {
              // Update package status instead of deleting
              await Package.findByIdAndUpdate(newPackage._id, { status: 'failed' });

              if (error.code === 'ECONNABORTED') {
                  throw new ApiError("Payment gateway timeout. Please try again.", 504);
              }

              if (error.response) {
                  throw new ApiError(
                      error.response.data?.errorMessage || "Payment gateway error",
                      error.response.status
                  );
              }

              if (error.request) {
                  throw new ApiError("No response from payment gateway", 503);
              } 

              throw error;
          }
      } else {
          // Update package status instead of deleting
          await Package.findByIdAndUpdate(newPackage._id, { status: 'failed' });
          throw new ApiError(`Unsupported payment method: ${paymentMethod}`, 400);
      }
      
  } catch (error) {
      // Update package status instead of deleting
      if (newPackage) {
          await Package.findByIdAndUpdate(newPackage._id, { status: 'failed' });
      }
      throw error;
  }
};

const confirmPayment = async (orderId, paymentStatus, store) => {
  try {
    // Check payment status with SATIM
    const params = {
      userName: process.env.SATIM_USERNAME,
      password: process.env.SATIM_PASSWORD,
      orderId: orderId
    };

    const response = await axios({
      method: 'get',
      url: 'https://test.satim.dz/payment/rest/getOrderStatus.do',
      params,
      headers: {
        'Accept': '*/*',
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    const packageId = store.package.id;
    // Find package   by orderId
    const package = await Package.findById(packageId);
    if (!package) {
      throw new ApiError("Package not found", 404);
    }


    // Map SATIM status to package status
    let paymentStatus = 'pending';
    if (response.data.OrderStatus === 2) {
      paymentStatus = 'paid';
      
      // Update package status
      package.status = paymentStatus;
      package.isActive = true;
      await package.save({validateBeforeSave: false});

      // Update store package info
      store.package = {
        ...store.package,
        status: paymentStatus,
        isActive: true,
        activatedAt: new Date(),
        expiresAt: new Date(new Date().setMonth(new Date().getMonth() + 1))
      };
      await store.save({validateBeforeSave: false});

    } else if (response.data.OrderStatus === 6) {
      paymentStatus = 'failed';
      
      // Update package status
      package.status = paymentStatus;
      package.isActive = false;
      await package.save({validateBeforeSave: false});

      // Update store package info
      store.package = {
        ...store.package,
        status: paymentStatus,
        isActive: false
      };
      await store.save({validateBeforeSave: false});
    }

    return {
      success: true,
      paymentStatus,
      package,
      satimResponse: response.data
    };
    
  } catch (error) {
    console.error('Payment confirmation error:', error);
    throw new ApiError(
      error.response?.data?.errorMessage || "Payment confirmation failed", 
      error.response?.status || 500
    );
  }
};

const getAllPackages = async () => {
  return await Package.find().populate('seller', 'email documents name package');
};

const getPackageById = async (packageId) => {
  const package = await Package.findById(packageId);
  if (!package) {
    throw new ApiError("Package not found", 404);
  }
  return package;
};

const updatePackage = async (packageId, packageData) => {
  const updatedPackage = await Package.findByIdAndUpdate(packageId, 
    {...packageData}, {
    new: true,
    runValidators: true,
  });
  if (!updatedPackage) {
    throw new ApiError("Package not found", 404);
  }
  return updatedPackage;
};

const deletePackage = async (packageId) => {
    const packageToDelete = await Package.findById(packageId);
    if (!packageToDelete) {
      throw new ApiError("Package not found", 404);
    }
  
    const sellerId = packageToDelete.seller;
  
    const deletedPackage = await Package.findByIdAndDelete(packageId);
  
    const store = await Store.findById(sellerId);
    if (store) {
      store.package = null;
      await store.save({validateBeforeSave: false});
    }
  
    return deletedPackage;
  };
  



module.exports = {
  createPackageAndProcessPayment,
  getAllPackages,
  getPackageById,
  updatePackage,
  deletePackage,
  confirmPayment,
};
