const multer = require("multer");
const path = require("path");
const ApiError = require("../utils/ApiError");

// storage and name 
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/images/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.fieldname}${path.extname(file.originalname)}`);
  },
});

// File filter for images
const imageFileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(null, false); // Reject the file instead of throwing an error
  }
  cb(null, true);
};


// Multer instance for image uploads
const imageUpload = multer({
  storage: imageStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limit to 10 MB
})

// Storage for CSV uploads
const csvStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/products/"); // Change this to your desired CSV upload directory
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.fieldname}${path.extname(file.originalname)}`);
  },
});

// Multer instance for CSV uploads
const csvUpload = multer({
  storage: csvStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit for CSV files
});

module.exports = {
  imageUpload,
  csvUpload,
};