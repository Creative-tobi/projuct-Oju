const jwt = require("jsonwebtoken");

exports.protect = async (req, res, next) => {
  let token;

  // 1. Check if the Authorization header exists and starts with "Bearer"
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    // Extract the token (Format: "Bearer eyJhbGciOiJIUz...")
    token = req.headers.authorization.split(" ")[1];
  }

  // 2. Reject if there is no token
  if (!token) {
    return res.status(401).json({
      error: "Not authorized to access this route. Please log in.",
    });
  }

  try {
    // 3. Verify the token using the secret key from your .env file
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your_super_secret_jwt_key",
    );

    // 4. Attach the decoded payload ({ id, role }) to the request object
    // This allows all subsequent controllers to easily access req.user.id
    req.user = decoded;

    // 5. Pass control to the next middleware or the controller
    next();
  } catch (error) {
    // If the token is invalid or expired, pass it to the global error handler
    next(error);
  }
};
