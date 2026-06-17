/**
 * Global Error Handling Middleware
 * Catches all errors passed via next(error) and returns
 * a structured JSON error response.
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message    = err.message    || 'Internal Server Error';

  // Mongoose bad ObjectId (CastError)
  if (err.name === 'CastError') {
    message    = `Resource not found with id: ${err.value}`;
    statusCode = 404;
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    message    = `Duplicate value for field: ${field}`;
    statusCode = 400;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    message    = Object.values(err.errors).map((e) => e.message).join(', ');
    statusCode = 422;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    message    = 'Invalid token. Please login again.';
    statusCode = 401;
  }
  if (err.name === 'TokenExpiredError') {
    message    = 'Token expired. Please login again.';
    statusCode = 401;
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
