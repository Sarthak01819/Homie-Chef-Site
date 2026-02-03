import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  const token =
    req.cookies.admin_token || req.cookies.token;


  /* =========================
     NO TOKEN
  ========================= */
  if (!token) {
    return res.status(401).json({
      code: "NO_TOKEN",
      message: "Authentication required",
    });
  }

  try {
    /* =========================
       VERIFY ACCESS TOKEN
    ========================= */
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    /* =========================
       ATTACH USER CONTEXT
    ========================= */
    const user = await User.findById(decoded.id).select(
      "_id name email role passwordChangedAt"
    );

    if (!user) {
      return res.status(401).json({
        code: "USER_NOT_FOUND",
        message: "User no longer exists",
      });
    }

    /* =========================
       🔐 H3.2 — PASSWORD CHANGE INVALIDATION
       (token replay protection)
    ========================= */
    if (
      user.passwordChangedAt &&
      decoded.iat * 1000 < user.passwordChangedAt.getTime()
    ) {
      return res.status(401).json({
        code: "TOKEN_REVOKED",
        message: "Session expired. Please log in again.",
      });
    }

    // Backward compatibility ✅
    req.userId = user._id;

    // Future usage (admin, permissions, audits)
    req.user = user;

    next();
  } catch (err) {
    /* =========================
       TOKEN ERROR HANDLING
    ========================= */
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        code: "TOKEN_EXPIRED",
        message: "Session expired",
      });
    }

    return res.status(401).json({
      code: "INVALID_TOKEN",
      message: "Invalid authentication token",
    });
  }
};
export const adminProtect = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
}