const ApiError = require('../utils/ApiError');
const dotenv = require('dotenv');

dotenv.config({ path: '../config/config.env' });

// module.exports = (err, req, res, next) => {
//     let error = { ...err };

//     error.message = err.message || 'Internal Server Error';
//     error.statusCode = err.statusCode || 500;

//     if (err.name === 'ValidationError') {
//         // Extract readable validation messages
//         const messages = Object.values(err.errors)
//             .map((error) => error.message)
//             .join(', ');
//         error = new ApiError(messages, 400);
//     }

//     if (process.env.NODE_ENV === 'DEVELOPMENT') {
//         return res.status(error.statusCode).json({
//             success: false,
//             message: error.message,
//             stack: process.env.NODE_ENV === 'DEVELOPMENT' ? err.stack : undefined,
//         });
//     }

//     if (process.env.NODE_ENV === 'PRODUCTION') {
//         return res.status(error.statusCode).json({
//             success: false,
//             message: error.message || 'Internal Server Error',
//         });
//     }

//     next();
// };

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  // Create a safe error response object
  const errorResponse = {
    success: false,
    error: {
      message: err.message,
      statusCode: err.statusCode
    }
  };

  // Add stack trace in development
  if (process.env.NODE_ENV === "development") {
    errorResponse.error.stack = err.stack;
  }

  res.status(err.statusCode).json(errorResponse);
};

module.exports = errorHandler;
