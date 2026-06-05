// We use the rest parameter (...roles) so you can pass one or multiple roles
// Example usage: requireRole("admin") OR requireRole("admin", "doctor")
exports.requireRole = (...roles) => {
  return (req, res, next) => {
    // 1. Ensure the user object exists (protect middleware should have added this)
    if (!req.user) {
      return res
        .status(401)
        .json({ error: "Not authorized. User data missing." });
    }

    // 2. Check if the user's role is included in the allowed roles array
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Your role (${req.user.role}) is not authorized to perform this action.`,
      });
    }

    // 3. If they have the right role, let them proceed
    next();
  };
};
