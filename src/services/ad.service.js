const Ad = require("../models/ad.model");
const Product = require("../models/product.model");
const ApiError = require("../utils/ApiError");
const Store = require("../models/store.model");

const createAd = async (adData, filePath) => {
  console.log(adData)
  const { title, description, product, startDate, endDate, price , store } = adData;
  const productExists = await Product.findById(product);
  if (!productExists) {
    throw new ApiError("Product does not exist", 400);
  }

  // Create the ad object
  const ad = new Ad({
    title,
    description,
    image: filePath || null,
    product,
    startDate,
    endDate,
    price: Number(price),
    store,
    status: "inactive", 
    isConfirmed: false,
  });

  // ad.updateAdStatus();

  // Save the ad to the database
  await ad.save({validateBeforeSave: false});
  return ad;
};

const updateAd = async (adId, adData, filePath) => {
  const ad = await Ad.findById(adId);
  if (!ad) {
    throw new ApiError("Ad not found", 404);
  }

  const { title, description, product, startDate, endDate, status, price } = adData;

  ad.title = title || ad.title;
  ad.description = description || ad.description;
  ad.image = filePath || ad.image;
  ad.product = product || ad.product;
  ad.startDate = startDate || ad.startDate;
  ad.endDate = endDate || ad.endDate;
  ad.status = status !== undefined ? status : ad.status;
  ad.price = price || ad.price;
  ad.isConfirmed = isConfirmed || ad.isConfirmed;

  await ad.save({validateBeforeSave: false});
  return ad;
};

const deleteAd = async (adId) => {
  const ad = await Ad.findById(adId);
  if (!ad) {
    throw new ApiError("Ad not found", 404);
  }
  await ad.deleteOne();
  return ad;
};

const getUnconfirmedAds = async (storeId) => {
  const ads = await Ad.find({ isConfirmed: false, store: storeId });
  return ads;
};


const confirmAd = async (adId, adData, storeId) => {
  const ad = await Ad.findById(adId);
  if (!ad) {
    throw new ApiError("Ad not found", 404);
  }

  if (!ad.store.equals(storeId)) {
    throw new ApiError("Ad does not belong to this store", 403);
  }

  if (ad.isConfirmed) {
    throw new ApiError("Ad already confirmed", 400);
  }

  const store = await Store.findById(storeId);
  if (!store) {
    throw new ApiError("Store not found", 404);
  }

  if (store.totalSales < ad.price) {
    throw new ApiError("Your Store does not have enough balance", 400);
  }

  // Deduct the price from the store's balance and confirm the ad
  store.totalSales -= ad.price;
  ad.isConfirmed = true;
  ad.status = "active";
  ad.store = storeId;

  // Use Promise.all to save both the store and ad concurrently
  await Promise.all([store.save({validateBeforeSave: false}), ad.save({validateBeforeSave: false})]);

  return ad;
};

// Fetch all ads and update their status based on current date
const getActiveAds = async () => {
  const currentDate = new Date(); 

  const ads = await Ad.find({}).populate("product");

  const activeAds = ads.filter(ad => {
    // ad.updateAdStatus(); 
    return ad.status === 'active'; 
  });

  return activeAds; 
};


// Get a single active ad by ID
const mongoose = require('mongoose');

const getActiveAdById = async (id) => {
  try {
    const allAds = await Ad.find({});

    const objectId = new mongoose.Types.ObjectId(id);

    const matchedAds = allAds.filter(ad => ad.product.equals(objectId));

    if (!matchedAds.length) {
      return null;
    }

    const activeAds = matchedAds.filter(ad => 
      ad.status === "active" && 
      new Date(ad.endDate) > new Date() 
    );

    if (!activeAds.length) {
      return null;
    }

    const activeAd = activeAds[0];


    if (activeAd.updateAdStatus) {
      activeAd.updateAdStatus();
    }

    return activeAd;

  } catch (error) {
    console.error("Error fetching ad:", error.message);
    throw new Error("Failed to fetch ad.");
  }
};





module.exports = {
  createAd,
  updateAd,
  deleteAd,
  getActiveAds,
  getActiveAdById,
  confirmAd,
  getUnconfirmedAds
};
