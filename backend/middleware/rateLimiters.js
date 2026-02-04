import rateLimit, { ipKeyGenerator } from "express-rate-limit";

/* =========================
   AUTH ROUTES (STRICT)
========================= */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // max 10 attempts
  message: {
    code: "TOO_MANY_ATTEMPTS",
    message: "Too many login attempts. Try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/* =========================
   REFRESH TOKEN (MODERATE)
========================= */
export const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: {
    code: "TOO_MANY_REFRESH",
    message: "Too many refresh requests",
  },
});

/* =========================
   PASSWORD RESET (STRICT)
========================= */
export const passwordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    message: "Too many password reset requests",
  },
});

/* =========================
   ADMIN AUTH (VERY STRICT)
========================= */
export const adminAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    message: "Admin login rate limit exceeded",
  },
});

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.APP_MODE === "production" ? 5 : 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many login attempts. Please try again later.",
  },
  keyGenerator: (req) => {
    // email-based limiting first, IP fallback (IPv6 safe)
    return (
      req.body?.email?.toLowerCase() ||
      ipKeyGenerator(req)
    );
  },
});
