import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "smart_cms_super_secret_jwt_key_2026";

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
