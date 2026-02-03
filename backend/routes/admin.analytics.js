import express from "express";
import User from "../models/User.js";
import Order from "../models/Order.js";
import UserSubscription from "../models/UserSubscription.js";
import AuditLog from "../models/AuditLog.js";
import { protect, adminProtect } from "../middleware/auth.js";

const router = express.Router();

const startOfDay = (d = new Date()) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate());

router.get("/", protect, adminProtect, async (req, res) => {
    try {
        const now = new Date();

        const [
            totalUsers,
            activeSubscriptions,
            ordersToday,
            revenueTodayAgg,
            subsByPlan,
            activeVsExpired,
            deliveriesToday,
            openCustomizations,
        ] = await Promise.all([
            User.countDocuments(),

            // Active subscriptions
            UserSubscription.countDocuments({ status: "active" }),

            // Orders today
            Order.countDocuments({ createdAt: { $gte: startOfDay(now) } }),

            // Revenue today
            Order.aggregate([
                { $match: { createdAt: { $gte: startOfDay(now) }, status: "paid" } },
                { $group: { _id: null, total: { $sum: "$amountPaid" } } },
            ]),

            // Subscriptions by plan duration
            UserSubscription.aggregate([
                {
                    $lookup: {
                        from: "subscriptionplans",
                        localField: "plan",
                        foreignField: "_id",
                        as: "plan",
                    },
                },
                { $unwind: "$plan" },
                { $group: { _id: "$plan.durationDays", count: { $sum: 1 } } },
            ]),

            // Active vs expired
            UserSubscription.aggregate([
                { $group: { _id: "$status", count: { $sum: 1 } } },
            ]),

            // Deliveries today (from AuditLog)
            AuditLog.countDocuments({
                event: "MEAL_DELIVERED",
                createdAt: { $gte: startOfDay(now) },
            }),

            // Open customization requests
            AuditLog.countDocuments({
                event: "CUSTOMIZATION_REQUEST",
                "metadata.status": { $ne: "resolved" },
            }),
        ]);

        res.json({
            summary: {
                totalUsers,
                activeSubscriptions,
                ordersToday,
                revenueToday: revenueTodayAgg[0]?.total || 0,
            },
            breakdowns: {
                subsByPlan,
                activeVsExpired,
            },
            ops: {
                deliveriesToday,
                openCustomizations,
            },
        });
    } catch (e) {
        res.status(500).json({ message: "Failed to load analytics" });
    }
});

export default router;
