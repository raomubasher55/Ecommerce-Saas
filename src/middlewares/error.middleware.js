const errorHandler = (err, req, res, next) => {
  console.error('Error Stack:', err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Server Error',
    stack: err.stack
  });
}; 