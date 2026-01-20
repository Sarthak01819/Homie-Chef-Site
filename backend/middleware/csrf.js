import crypto from "crypto";

export const generateCsrfToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

export const csrfProtect = (req, res, next) => {
  const csrfCookie = req.cookies.csrfToken;
  const csrfHeader = req.headers["x-csrf-token"];

  if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
    return res.status(403).json({
      code: "CSRF_MISMATCH",
      message: "Invalid CSRF token",
    });
  }

  next();
};
