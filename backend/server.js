import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import adminRoutes from "./routes/admin.routes.js";
import authRoutes from "./routes/auth.js";
import mealRoutes from "./routes/meals.js";
import orderRoutes from "./routes/orders.js";
import subscriptionRoutes from "./routes/subscriptions.js";
import paymentRoutes from "./routes/payments.js";

import { errorHandler } from "./middleware/errorHandler.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { initSentry, Sentry } from "./utils/sentry.js";

dotenv.config(); // ✅ MUST be first

const app = express();
const IS_PROD = process.env.APP_MODE === "production";

/* =========================
   🔍 ENV VALIDATION
========================= */
const requiredEnv = [
  "JWT_SECRET",
  "JWT_REFRESH_SECRET",
  "MONGO_URI",
  "FRONTEND_URL",
];

requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    console.error(`❌ Missing ENV: ${key}`);
    process.exit(1);
  }
});

/* =========================
   🛡️ SENTRY INIT (v8 SAFE)
========================= */
initSentry();

/* =========================
   🧨 PROCESS-LEVEL SAFETY
========================= */
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED PROMISE REJECTION:", err);
  Sentry.captureException(err);
});

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err);
  Sentry.captureException(err);
  process.exit(1); // fail fast
});

/* =========================
   🔐 HELMET HARDENING (H3.1)
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
   🚦 RATE LIMIT
========================= */
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

/* =========================
   BODY & COOKIE PARSERS
========================= */
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

/* =========================
   🌍 CORS CONFIG
========================= */
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.ADMIN_FRONTEND_URL,
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
   🧾 REQUEST LOGGING
========================= */
app.use(requestLogger);

/* =========================
   🚀 ROUTES
========================= */
app.use("/auth", authRoutes);
app.use("/meals", mealRoutes);
app.use("/orders", orderRoutes);
app.use("/subscriptions", subscriptionRoutes);
app.use("/payments", paymentRoutes);
app.use("/admin", adminRoutes);

/* =========================
   ❤️ HEALTH CHECK
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
   ❗ GLOBAL ERROR HANDLER
   (Sentry v8 compatible)
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
