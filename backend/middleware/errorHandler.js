/**
 * Global error handler middleware
 * Handles all errors and sends appropriate response
 */

/**
 * Error response handler
 * @param {Object} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log to console for development
  console.error(err);

  // PostgreSQL error handling
  if (err.code === "23505") {
    const message = "Duplicate field value entered";
    error = new Error(message);
    error.statusCode = 400;
  }

  if (err.code === "23503") {
    const message = "Database relation constraint violation";
    error = new Error(message);
    error.statusCode = 400;
  }

  // Send error response
  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || "Server Error",
  });
};
