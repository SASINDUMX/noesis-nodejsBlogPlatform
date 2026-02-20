const multer = require("multer");

/**
 * Centralised error handling middleware.
 * Must be registered LAST in index.js (after all routes).
 */
function errorHandler(err, req, res, next) {
  // Multer file size / type errors
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "File too large. Maximum size is 5MB." });
    }
    return res.status(400).json({ error: `Upload error: ${err.message}` });
  }

  // Custom file type error thrown from fileFilter
  if (err.message === "Only images are allowed!") {
    return res.status(400).json({ error: "Only JPEG, JPG, PNG and GIF images are allowed." });
  }

  // Mongoose validation errors
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ error: messages.join(", ") });
  }

  // Mongoose duplicate key (e.g. unique username/email)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({ error: `${field} already exists.` });
  }

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    return res.status(400).json({ error: "Invalid ID format." });
  }

  // Log unexpected errors server-side (don't expose internals to client)
  console.error(`[${new Date().toISOString()}] Unhandled error:`, err);

  res.status(err.status || 500).json({
    error:
      process.env.NODE_ENV === "production"
        ? "An internal server error occurred."
        : err.message,
  });
}

module.exports = { errorHandler };
