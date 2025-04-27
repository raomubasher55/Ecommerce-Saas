const cron = require('node-cron');
const Product = require('../models/product.model');
const Store = require('../models/store.model');
const Package = require('../models/Package.model');

// Function to update product discounts
async function updateProductDiscounts() {
  try {
    const currentDate = new Date();
    
    // Find products that need discount activation
    const productsToUpdate = await Product.find({
      discountPercentage: { $gt: 0 },
      discountStartDate: { $lte: currentDate },
      discountEndDate: { $gte: currentDate },
      $or: [
        { discountedPrice: null },
        { discountedPrice: 0 }
      ]
    });

    // Update each product's discount
    for (const product of productsToUpdate) {
      product.discountedPrice = product.price - (product.price * (product.discountPercentage / 100));
      await product.save({ validateBeforeSave: false });
    }

    // Find and update products where discount should be deactivated
    const deactivateDiscounts = await Product.updateMany(
      {
        discountPercentage: { $gt: 0 },
        $or: [
          { discountEndDate: { $lt: currentDate } },
          { discountStartDate: { $gt: currentDate } }
        ],
        discountedPrice: { $ne: null }
      },
      {
        $set: { 
          discountedPrice: 0,
          discountPercentage: 0 
        }
      }
    );

    console.log(`[${new Date().toISOString()}] Discount scheduler: Activated ${productsToUpdate.length} discounts, Deactivated ${deactivateDiscounts.modifiedCount} discounts`);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Discount scheduler error:`, error);
  }
}

// Function to check and update expired packages
async function updateExpiredPackages() {
  try {
    const currentDate = new Date();
    
    // Find stores with expired packages
    const expiredPackages = await Store.updateMany(
      {
        'package.expiresAt': { $lt: currentDate },
        'package.id': { $ne: null }
      },
      {
        $set: {
          'package.id': null,
          'package.name': null,
          'package.expiresAt': null
        }
      }
    );

    console.log(`[${new Date().toISOString()}] Package scheduler: Updated ${expiredPackages.modifiedCount} expired packages`);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Package scheduler error:`, error);
  }
}

// Start all schedulers
exports.startSchedulers = () => {
  // Run discount updates every 15 minutes
  cron.schedule('*/15 * * * *', updateProductDiscounts);
  
  // Run package expiration check every hour
  cron.schedule('0 * * * *', updateExpiredPackages);
  
  console.log('Schedulers started: Discount (15min), Package expiration (1hour)');
}; 