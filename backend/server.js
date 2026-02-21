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

import { requestLogger } from "./middleware/requestLogger.js";
import { initSentry, Sentry } from "./utils/sentry.js";

dotenv.config();

const app = express();
app.set("trust proxy", 1);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const IS_PROD = process.env.NODE_ENV === "production";

/* =========================
   SECURITY
========================= */
initSentry();

app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false,
  })
);

/* =========================
   PARSERS
========================= */
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

/* =========================
   CORS
========================= */
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.ADMIN_FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:5174",
];

app.use(
  cors({
    origin(origin, cb) {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error("CORS blocked"));
    },
    credentials: true,
  })
);

/* =========================
   LOGGING
========================= */
app.use(requestLogger);

/* =========================
   RATE LIMITING
========================= */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: IS_PROD ? 5 : 50,
  message: { message: "Too many login attempts. Try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

const adminLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 20,
  message: { message: "Too many admin actions." },
});

app.use(apiLimiter);

/* =========================
   ROUTES
========================= */
app.use("/api/auth", authRoutes);
app.use("/api/meals", mealRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/payments", paymentRoutes);

app.use("/api/admin/analytics", adminAnalyticsRoutes);
app.use("/api/admin/controls", adminLimiter, adminControlsRoutes);
app.use("/api/admin/realtime", adminRealtimeRoutes);
app.use("/api/admin", adminRoutes);

/* =========================
   HEALTH CHECK
========================= */
app.get("/api/health", (_, res) => {
  res.json({
    status: "OK",
    time: new Date().toISOString(),
  });
});

/* =========================
   FRONTEND SERVE (SPA FIX)
========================= */
if (IS_PROD) {
  app.use(express.static(path.join(__dirname, "public")));

  // ✅ SPA fallback for all GET requests not prefixed with /api
  app.use((req, res, next) => {
    // If it's a GET request and the path does NOT start with '/api'
    if (req.method === "GET" && !req.path.startsWith("/api")) {
      res.sendFile(path.join(__dirname, "public", "index.html"));
    } else {
      // For all other requests (POST, PUT, DELETE, or GET to /api),
      // continue to the next middleware (which will be your API routes or the 404 handler)
      next();
    }
  });
}

/* =========================
   ERROR HANDLER
========================= */
app.use((err, req, res, next) => {
  console.error("UNHANDLED ERROR:", err);
  Sentry.captureException(err);
  res.status(500).json({ message: "Internal server error" });
});

/* =========================
   DATABASE
========================= */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected ✅"))
  .catch((err) => {
    console.error("Mongo error ❌", err);
    process.exit(1);
  });

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT} 🚀`)
);
