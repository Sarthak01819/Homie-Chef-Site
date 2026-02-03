import express from "express";
import User from "../models/User.js";
import Subscription from "../models/SubscriptionPlan.js";
import AuditLog from "../models/AuditLog.js";
import { protect, adminProtect } from "../middleware/auth.js";

const router = express.Router();

/* =========================
   ⏸ Pause Subscription
========================= */
router.post("/subscriptions/:id/pause", protect, adminProtect, async (req, res) => {
    const sub = await Subscription.findById(req.params.id);
    if (!sub) return res.status(404).json({ message: "Subscription not found" });
    if (sub.status === "paused") return res.json(sub);

    sub.status = "paused";
    await sub.save();

    await AuditLog.create({
        event: "SUBSCRIPTION_PAUSED",
        performedBy: req.user._id,
        metadata: { subscriptionId: sub._id },
    });

    res.json(sub);
});

/* =========================
   ▶️ Resume Subscription
========================= */
router.post("/subscriptions/:id/resume", protect, adminProtect, async (req, res) => {
    const sub = await Subscription.findById(req.params.id);
    if (!sub) return res.status(404).json({ message: "Subscription not found" });
    if (sub.status === "active") return res.json(sub);

    sub.status = "active";
    await sub.save();

    await AuditLog.create({
        event: "SUBSCRIPTION_RESUMED",
        performedBy: req.user._id,
        metadata: { subscriptionId: sub._id },
    });

    res.json(sub);
});

/* =========================
   ❌ Cancel Subscription
========================= */
router.post("/subscriptions/:id/cancel", protect, adminProtect, async (req, res) => {
    const sub = await Subscription.findById(req.params.id);
    if (!sub) return res.status(404).json({ message: "Subscription not found" });
    if (sub.status === "cancelled") return res.json(sub);

    sub.status = "cancelled";
    sub.cancelledAt = new Date();
    await sub.save();

    await AuditLog.create({
        event: "SUBSCRIPTION_CANCELLED",
        performedBy: req.user._id,
        metadata: { subscriptionId: sub._id },
    });

    res.json(sub);
});

/* =========================
   🔐 Force Logout User
========================= */
router.post("/users/:id/force-logout", protect, adminProtect, async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.refreshTokens = []; // invalidate all sessions
    await user.save();

    await AuditLog.create({
        event: "FORCE_LOGOUT",
        performedBy: req.user._id,
        metadata: { userId: user._id },
    });

    res.json({ success: true });
});

export default router;
