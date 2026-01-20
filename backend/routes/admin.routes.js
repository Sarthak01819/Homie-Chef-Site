import express from "express";
import { protect } from "../middleware/auth.js";
import { adminProtect } from "../middleware/adminProtect.js";
import Order from "../models/Order.js";
import User from "../models/User.js";
import AuditLog from "../models/AuditLog.js";

const router = express.Router();

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

        const activeSubscriptions = await User.countDocuments({
            "subscription.status": "active",
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

export default router;
