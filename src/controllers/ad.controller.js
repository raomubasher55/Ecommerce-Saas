const adService = require("../services/ad.service");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors.middleware");

exports.createAd = catchAsyncErrors(async (req, res, next) => {
  const adData = req.body;
  const filePath = req.file ? req.file.path : null;
  const ad = await adService.createAd(adData, filePath);

  res.status(201).json({
    success: true,
    message: "Advertisement created successfully",
    ad,
  });
});

exports.updateAd = catchAsyncErrors(async (req, res, next) => {
  const adId = req.params.id;
  const adData = req.body;
  const filePath = req.file ? req.file.path : null;

  const ad = await adService.updateAd(adId, adData, filePath);

  res.status(200).json({
    success: true,
    message: "Advertisement updated successfully",
    ad,
  });
});

exports.deleteAd = catchAsyncErrors(async (req, res, next) => {
  const adId = req.params.id;
console.log(adId)
  await adService.deleteAd(adId);

  res.status(200).json({
    success: true,
    message: "Advertisement deleted successfully",
  });
});

exports.getUnconfirmedAds = catchAsyncErrors(async (req, res, next) => {
  const storeId = req.store._id;
  const ads = await adService.getUnconfirmedAds(storeId);
  res.status(200).json({
    success: true,
    ads,
  });
});

exports.confirmAd = catchAsyncErrors(async (req, res, next) => {
  const storeId = req.store._id;
  const adId = req.params.id;
  const adData = req.body;
  const ad = await adService.confirmAd(adId, adData, storeId);
  res.status(200).json({
    success: true,
    message: "Advertisement confirmed successfully",
    ad,
  });
});



exports.getActiveAds = catchAsyncErrors(async (req, res, next) => {
  try {
    const activeAds = await adService.getActiveAds();

    if (!activeAds || activeAds.length === 0) {
      return res.status(404).json({ success: false, message: "No active ads found" });
    }

    res.status(200).json({
      success: true,
      ads: activeAds,
    });
  } catch (error) {
    console.error("Error fetching active ads:", error);
    next(error);
  }
});



// Get a single active ad by ID
exports.getActiveAdById = catchAsyncErrors(async (req, res, next) => {
  try {
    const { id } = req.params;
    const activeAd = await adService.getActiveAdById(id);
    
    res.status(200).json({
      success: true,
      ad: activeAd,
    });
  } catch (error) {
    console.error("Error fetching active ad by ID:", error);
    next(error);
  }
});

