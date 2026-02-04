import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";

import adminRoutes from "./routes/admin.routes.js";
import authRoutes from "./routes/auth.js";
import mealRoutes from "./routes/meals.js";
import orderRoutes from "./routes/orders.js";
import subscriptionRoutes from "./routes/subscriptions.js";
import paymentRoutes from "./routes/payments.js";
import adminAnalyticsRoutes from "./routes/admin.analytics.js";
import adminControlsRoutes from "./routes/admin.controls.js";
import adminRealtimeRoutes from "./routes/admin.realtime.js";

import { errorHandler } from "./middleware/errorHandler.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { initSentry, Sentry } from "./utils/sentry.js";

dotenv.config(); // ✅ MUST be first

const app = express();
app.set("trust proxy", 1);
const IS_PROD = process.env.APP_MODE === "production";

/* =========================
   🔍 ENV VALIDATION
========================= */
const requiredEnv = [
  "JWT_SECRET",
  "JWT_REFRESH_SECRET",
  "MONGO_URI",
  "FRONTEND_URL",
  "ADMIN_FRONTEND_URL",
];

requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    console.error(`❌ Missing ENV: ${key}`);
    process.exit(1);
  }
});

/* =========================
   🛡️ SENTRY INIT
========================= */
initSentry();

/* =========================
   🧨 PROCESS SAFETY
========================= */
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED PROMISE REJECTION:", err);
  Sentry.captureException(err);
});

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err);
  Sentry.captureException(err);
  process.exit(1);
});

/* =========================
   🔐 HELMET
========================= */
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://checkout.razorpay.com"],
        frameSrc: ["'self'", "https://checkout.razorpay.com"],
        connectSrc: [
          "'self'",
          process.env.FRONTEND_URL,
          process.env.ADMIN_FRONTEND_URL,
        ],
        imgSrc: ["'self'", "data:", "https:"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        fontSrc: ["'self'", "https:", "data:"],
      },
    },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    frameguard: { action: "deny" },
    hidePoweredBy: true,
  })
);

/* =========================
   BODY & COOKIES
========================= */
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

/* =========================
   🌍 CORS
========================= */
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.ADMIN_FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:5174",
];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

/* =========================
   🧾 LOGGING
========================= */
app.use(requestLogger);

/* =========================
   🚦 API RATE LIMIT
========================= */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(apiLimiter);

/* =========================
   🔐 AUTH RATE LIMIT
========================= */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: IS_PROD ? 5 : 50,
  message: {
    message: "Too many login attempts. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const adminActionLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 20,
  message: { message: "Too many admin actions. Slow down." },
});

app.use("/admin/controls", adminActionLimiter);

/* =========================
   🚀 API ROUTES
========================= */
app.use("/auth", authLimiter, authRoutes);
app.use("/meals", mealRoutes);
app.use("/orders", orderRoutes);
app.use("/subscriptions", subscriptionRoutes);
app.use("/payments", paymentRoutes);
app.use("/admin", adminRoutes);
app.use("/admin/analytics", adminAnalyticsRoutes);
app.use("/admin/controls", adminControlsRoutes);
app.use("/admin/realtime", adminRealtimeRoutes);

/* =========================
   ❤️ HEALTH
========================= */
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    server: "Homie Chef Backend",
    mode: process.env.APP_MODE,
    time: new Date().toISOString(),
  });
});

/* =========================
   🟢 SPA FALLBACK (FIX)
========================= */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// serve frontend build
app.use(express.static(path.join(__dirname, "../frontend/dist")));

// React Router reload support
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

/* =========================
   ❗ ERROR HANDLER
========================= */
app.use((err, req, res, next) => {
  console.error("🔥 UNHANDLED ERROR:", err);
  Sentry.captureException(err);

  res.status(500).json({
    message: "Something went wrong",
  });
});

/* =========================
   🗄️ DATABASE
========================= */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => {
    console.error("MongoDB Connection Error ❌", err);
    process.exit(1);
  });

/* =========================
   🟢 SERVER
========================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
});
