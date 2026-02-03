import express from "express";
import { protect } from "../middleware/auth.js";
import { adminProtect } from "../middleware/adminProtect.js";
import Order from "../models/Order.js";
import User from "../models/User.js";
import UserSubscription from "../models/UserSubscription.js";
import AuditLog from "../models/AuditLog.js";
import { sendAdminEvent } from "./admin.realtime.js";

const router = express.Router();

router.get("/me", protect, adminProtect, (req, res) => {
    res.json({
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
    });
});

/* =========================
   ADMIN HEALTH CHECK
========================= */
router.get("/test", protect, adminProtect, (req, res) => {
    res.json({
        message: "Admin access verified",
        admin: {
            id: req.admin._id,
            name: req.admin.name,
            email: req.admin.email,
        },
    });
});

/* =========================
   USER DELIVERY CONFIRMATION
========================= */
router.post("/deliveries", protect, async (req, res) => {
    try {
        const { subscriptionId, day, mealType, deliveredAt } = req.body;

        if (!subscriptionId || !day || !mealType) {
            return res.status(400).json({ message: "Missing delivery fields" });
        }

        const log = await AuditLog.create({
            event: "MEAL_DELIVERED",
            performedBy: req.user._id,
            userId: req.user._id,
            role: "user",
            ip: req.ip,
            userAgent: req.headers["user-agent"],
            metadata: {
                subscriptionId,
                day,
                mealType,
                deliveredAt: deliveredAt || new Date().toISOString(),
            },
        });

        sendAdminEvent("MEAL_DELIVERED", {
            subscriptionId,
            day,
            mealType,
            user: req.user.email,
        });

        res.json(log);
    } catch (err) {
        res.status(500).json({ message: "Failed to log delivery" });
    }
});

/* =========================
   USER CUSTOMIZATION REQUEST
========================= */
router.post("/customization-requests", protect, async (req, res) => {
    try {
        const { subscriptionId, type, message, preferredDate } = req.body;

        if (!subscriptionId || !type || !message) {
            return res.status(400).json({ message: "Missing request fields" });
        }

        const log = await AuditLog.create({
            event: "CUSTOMIZATION_REQUEST",
            performedBy: req.user._id,
            userId: req.user._id,
            role: "user",
            ip: req.ip,
            userAgent: req.headers["user-agent"],
            metadata: {
                subscriptionId,
                type,
                userMessage: message,
                preferredDate,
                status: "open",
                adminNote: "",
            },
        });

        sendAdminEvent("CUSTOMIZATION_REQUEST", {
            subscriptionId,
            user: req.user.email,
        });

        res.status(201).json(log);
    } catch (err) {
        res.status(500).json({ message: "Failed to submit request" });
    }
});

/* =========================
   GET ALL ORDERS (ADMIN)
========================= */
router.get("/orders", protect, adminProtect, async (req, res) => {
    try {
        const orders = await Order.find()
            .sort({ createdAt: -1 })
            .populate("user", "name email phone")
            .populate("items.meal")
            .populate("subscription");

        res.json(orders);
    } catch (err) {
        console.error("ADMIN ORDERS ERROR:", err);
        res.status(500).json({ message: "Failed to fetch orders" });
    }
});

/* =========================
   GET ALL USERS (ADMIN)
========================= */
router.get("/users", protect, adminProtect, async (req, res) => {
    try {
        const users = await User.find().select(
            "name email phone role createdAt"
        );

        res.json(users);
    } catch (err) {
        console.error("ADMIN USERS ERROR:", err);
        res.status(500).json({ message: "Failed to fetch users" });
    }
});

/* =========================
   ADMIN DASHBOARD STATS
========================= */
router.get("/stats", protect, adminProtect, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalOrders = await Order.countDocuments();

        const revenueAgg = await Order.aggregate([
            { $match: { status: { $in: ["paid", "refunded"] } } },
            { $group: { _id: null, total: { $sum: "$amountPaid" } } },
        ]);

        const totalRevenue = revenueAgg[0]?.total || 0;

        const activeSubscriptions = await UserSubscription.countDocuments({
            status: "active",
        });

        res.json({
            totalUsers,
            totalOrders,
            totalRevenue,
            activeSubscriptions,
        });
    } catch (err) {
        console.error("ADMIN STATS ERROR:", err);
        res.status(500).json({ message: "Failed to fetch admin stats" });
    }
});

/* =========================
   AUDIT LOGS (H4.4)
   READ-ONLY, ADMIN ONLY
========================= */
router.get("/audit-logs", protect, adminProtect, async (req, res) => {
    try {
        const {
            severity,
            event,
            userId,
            page = 1,
            limit = 50,
        } = req.query;

        const filter = {};
        if (severity) filter.severity = severity;
        if (event) filter.event = event;
        if (userId) filter.userId = userId;

        const logs = await AuditLog.find(filter)
            .sort({ createdAt: -1 })
            .limit(Math.min(Number(limit), 200))
            .skip((Number(page) - 1) * Number(limit));

        res.json(logs);
    } catch (err) {
        console.error("AUDIT LOG FETCH ERROR:", err);
        res.status(500).json({ message: "Failed to fetch audit logs" });
    }
});

/* =========================
   DELIVERY CONFIRMATION
========================= */
router.get("/deliveries", protect, adminProtect,
    async (req, res) => {
        try {
            const { date, mealType, email } = req.query;

            const query = {
                event: "MEAL_DELIVERED",
            };

            // 📅 Filter by date (YYYY-MM-DD)
            if (date) {
                const start = new Date(date);
                const end = new Date(date);
                end.setDate(end.getDate() + 1);

                query.createdAt = { $gte: start, $lt: end };
            }

            // 🍽 Filter by meal type
            if (mealType) {
                query["metadata.mealType"] = mealType;
            }

            let logs = await AuditLog.find(query)
                .sort({ createdAt: -1 })
                .populate("performedBy", "name email");

            // 👤 Filter by user email (post-populate)
            if (email) {
                logs = logs.filter(
                    (l) =>
                        l.performedBy?.email
                            ?.toLowerCase()
                            .includes(email.toLowerCase())
                );
            }

            res.json(logs);
        } catch (err) {
            res.status(500).json({
                message: "Failed to fetch delivery logs",
            });
        }
    }
);

router.get("/customizations", protect, adminProtect,
    async (req, res) => {
            const logs = await AuditLog.find({
                event: "CUSTOMIZATION_REQUEST",
            })
                .sort({ createdAt: -1 })
                .populate("performedBy", "name email");

        res.json(logs);
    }
);

/* =========================
   CUSTOMIZATION REQUEST
========================= */
router.get("/customization-requests", protect, adminProtect,
    async (req, res) => {
        try {
            const requests = await AuditLog.find({
                event: "CUSTOMIZATION_REQUEST",
            })
                .sort({ createdAt: -1 })
                .populate("performedBy", "name email");

            res.json(requests);
        } catch (err) {
            res.status(500).json({
                message: "Failed to fetch customization requests",
            });
        }
    }
);

router.patch("/customizations/:id", protect, adminProtect, async (req, res) => {
    try {
        const { status, adminNote } = req.body;
        const log = await AuditLog.findById(req.params.id);
        if (!log || log.event !== "CUSTOMIZATION_REQUEST") {
            return res.status(404).json({ message: "Request not found" });
        }

        log.metadata.status = status;
        if (adminNote !== undefined) {
            log.metadata.adminNote = adminNote;
        }

        await log.save();

        // 🔒 Audit admin action
        await AuditLog.create({
            event: "CUSTOMIZATION_STATUS_UPDATED",
            performedBy: req.user._id,
            metadata: {
                requestId: log._id,
                newStatus: status,
            },
        });

        res.json(log);
    } catch (e) {
        res.status(500).json({
            message: "Failed to update customization",
        });
    }
}
);

/* =========================
   SUBSCRIPTION CONTROLS
========================= */
router.post("/subscriptions/:id/pause", protect,adminProtect,
  async (req, res) => {
    try {
      // 🔐 Belt + suspenders
      if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Admin only" });
      }

      const sub = await User.findOne({ "subscription._id": req.params.id });
      if (!sub) {
        return res.status(404).json({ message: "Subscription not found" });
      }

      // 🛑 State guard
      if (sub.subscription.status === "cancelled") {
        return res.status(400).json({
          message: "Cancelled subscriptions cannot be modified",
        });
      }

      if (sub.subscription.status === "paused") {
        return res.json(sub.subscription);
      }

      sub.subscription.status = "paused";
      await sub.save();

      await AuditLog.create({
        event: "SUBSCRIPTION_PAUSED",
        performedBy: req.user._id,
        metadata: { subscriptionId: sub.subscription._id },
      });

      res.json(sub.subscription);
    } catch (err) {
      res.status(500).json({ message: "Failed to pause subscription" });
    }
  }
);

/* =========================
   RESUME SUBSCRIPTION
========================= */
router.post("/subscriptions/:id/resume", protect, adminProtect,
  async (req, res) => {
    try {
      // 🔐 Extra safety
      if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Admin only" });
      }

      const user = await User.findOne({
        "subscription._id": req.params.id,
      });

      if (!user) {
        return res.status(404).json({ message: "Subscription not found" });
      }

      // 🛑 Guardrails
      if (user.subscription.status === "cancelled") {
        return res.status(400).json({
          message: "Cancelled subscriptions cannot be resumed",
        });
      }

      if (user.subscription.status === "active") {
        return res.json(user.subscription);
      }

      user.subscription.status = "active";
      await user.save();

      await AuditLog.create({
        event: "SUBSCRIPTION_RESUMED",
        performedBy: req.user._id,
        metadata: {
          subscriptionId: user.subscription._id,
        },
      });

      res.json(user.subscription);
    } catch (err) {
      res.status(500).json({
        message: "Failed to resume subscription",
      });
    }
  }
);

/* =========================
   CANCEL SUBSCRIPTION
========================= */
router.post("/subscriptions/:id/cancel", protect, adminProtect,
  async (req, res) => {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Admin only" });
      }

      const user = await User.findOne({
        "subscription._id": req.params.id,
      });

      if (!user) {
        return res.status(404).json({ message: "Subscription not found" });
      }

      if (user.subscription.status === "cancelled") {
        return res.json(user.subscription);
      }

      user.subscription.status = "cancelled";
      user.subscription.cancelledAt = new Date();
      await user.save();

      await AuditLog.create({
        event: "SUBSCRIPTION_CANCELLED",
        performedBy: req.user._id,
        metadata: {
          subscriptionId: user.subscription._id,
        },
      });

      res.json(user.subscription);
    } catch (err) {
      res.status(500).json({
        message: "Failed to cancel subscription",
      });
    }
  }
);

/* =========================
   FORCE LOGOUT USER
========================= */
router.post("/users/:id/force-logout", protect, adminProtect,
  async (req, res) => {
    try {
      // 🔐 Extra belt & suspenders
      if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Admin only" });
      }

      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // 🔥 Invalidate all sessions
      user.refreshTokens = [];
      await user.save();

      // 🧾 Audit trail
      await AuditLog.create({
        event: "FORCE_LOGOUT",
        performedBy: req.user._id,
        metadata: {
          userId: user._id,
          reason: "Admin initiated force logout",
        },
      });

      res.json({
        success: true,
        message: "User logged out from all devices",
      });
    } catch (err) {
      console.error("FORCE LOGOUT ERROR:", err);
      res.status(500).json({
        message: "Failed to force logout user",
      });
    }
  }
);



export default router;
