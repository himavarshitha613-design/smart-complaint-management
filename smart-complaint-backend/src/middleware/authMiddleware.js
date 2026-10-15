import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "smart_cms_super_secret_jwt_key_2026";

// Strict authentication (blocks request if missing or invalid)
export const authenticateUser = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No authorization token provided."
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: "Invalid or expired authorization token."
    });
  }
};

// Optional authentication (populates req.user if token is present, continues even if not)
export const optionalAuthenticateUser = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    }
  } catch (error) {
    // Silently continue without user context if token expired/invalid
  }
  next();
};

// Admin-only protection
export const requireAdmin = (req, res, next) => {
  authenticateUser(req, res, () => {
    if (req.user && req.user.role === "admin") {
      next();
    } else {
      res.status(403).json({
        success: false,
        message: "Forbidden: Administrator privileges required."
      });
    }
  });
};
