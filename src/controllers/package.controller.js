const packageService = require("../services/package.service");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors.middleware");


exports.createPackageAndProcessPayment = catchAsyncErrors(async (req, res, next) => {
  try {
    const { packageType, paymentMethod } = req.body;
    
    // Skip validation for the store
    const store = req.store;
    
    const package = await packageService.createPackageAndProcessPayment(store, packageType, paymentMethod);
    res.status(200).json({
      success: true,
      message: "Payment successful. Package subscribed.",
      package,
    });
  } catch (error) {
    console.error("Error in createPackageAndProcessPayment:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

exports.confirmPayment = catchAsyncErrors(async (req, res) => {
  const { packageId } = req.params;
  const { paymentStatus } = req.body;

  const updatedPackage = await packageService.confirmPayment(packageId, paymentStatus , req.store);
  res.status(200).json({ success: true, data: updatedPackage });
});

exports.getAllPackages = catchAsyncErrors(async (req, res) => {
  const packages = await packageService.getAllPackages();
  res.status(200).json({ success: true, data: packages });
});

exports.getPackageById = catchAsyncErrors(async (req, res) => {
  const package = await packageService.getPackageById(req.params.id);
  res.status(200).json({ success: true, data: package });
});

exports.updatePackage = catchAsyncErrors(async (req, res) => {
  const updatedPackage = await packageService.updatePackage(req.params.id, req.body);
  res.status(200).json({ success: true, data: updatedPackage });
});

exports.deletePackage = catchAsyncErrors(async (req, res) => {
  await packageService.deletePackage(req.params.id);
  res.status(200).json({ success: true, message: "Package deleted successfully" });
});

