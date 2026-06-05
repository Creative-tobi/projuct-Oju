const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log to console for debugging in VS Code
  console.error("🔴 Error Caught by Middleware:", err.name, err.message);

  // 1. Mongoose Bad ObjectId (e.g., searching for an appointment with a missing character)
  if (err.name === "CastError") {
    const message = `Resource not found. Invalid ID format: ${err.value}`;
    return res.status(404).json({ error: message });
  }

  // 2. Mongoose Duplicate Key (e.g., registering an email or phone number that already exists)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `An account with that ${field} already exists.`;
    return res.status(400).json({ error: message });
  }

  // 3. Mongoose Validation Error (e.g., missing required fields)
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
    return res.status(400).json({ error: message });
  }

  // 4. JWT Authentication Errors
  if (err.name === "JsonWebTokenError") {
    const message = "Invalid authentication token. Please log in again.";
    return res.status(401).json({ error: message });
  }

  if (err.name === "TokenExpiredError") {
    const message = "Your session has expired. Please log in again.";
    return res.status(401).json({ error: message });
  }

  // 5. Default Fallback
  res.status(error.statusCode || 500).json({
    error: error.message || "Internal Server Error",
  });
};

module.exports = errorHandler;
