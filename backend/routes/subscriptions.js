import express from "express";
import SubscriptionPlan from "../models/SubscriptionPlan.js";
import UserSubscription from "../models/UserSubscription.js";
import Order from "../models/Order.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

/* =========================
   GET ALL SUBSCRIPTION PLANS
   GET /subscriptions
========================= */
router.get("/", async (req, res) => {
    try {
        const plans = await SubscriptionPlan.find()
            .populate("mealsByDay.lunch.meal")
            .populate("mealsByDay.dinner.meal");

        res.json(plans);
    } catch (err) {
        console.error("SUBSCRIPTIONS ERROR:", err);
        res.status(500).json({ message: "Failed to load subscriptions" });
    }
});


/* =========================
   GET MY ACTIVE SUBSCRIPTION
   GET /subscriptions/my
========================= */
router.get("/my", protect, async (req, res) => {
    try {
        const subscription = await UserSubscription.findOne({
            user: req.userId,
            status: "active",
        }).populate({
            path: "plan",
            populate: [
                { path: "mealsByDay.lunch.meal", model: "Meal" },
                { path: "mealsByDay.dinner.meal", model: "Meal" },
            ],
        });


        res.json(subscription || null);
    } catch (err) {
        console.error("FETCH SUBSCRIPTION ERROR:", err);
        res.status(500).json({ message: "Failed to fetch subscription" });
    }
});

/* =========================
   CANCEL SUBSCRIPTION
   POST /subscriptions/cancel
========================= */
router.post("/cancel", protect, async (req, res) => {
    try {
        const subscription = await UserSubscription.findOne({
            user: req.userId,
            status: "active",
        }).populate("plan");

        if (!subscription) {
            return res.status(404).json({
                message: "No active subscription found",
            });
        }

        const now = new Date();
        const diffMinutes =
            (now - new Date(subscription.startDate)) / (1000 * 60);

        let refundAmount;
        let penalty = 0;

        if (diffMinutes <= 60) {
            refundAmount = subscription.plan.basePrice;
        } else {
            penalty = Math.round(subscription.plan.basePrice * 0.1);
            refundAmount = subscription.plan.basePrice - penalty;
        }

        subscription.status = "cancelled";
        subscription.cancelledAt = now;
        subscription.refundAmount = refundAmount;
        await subscription.save();

        await Order.create({
            user: req.userId,
            type: "subscription",
            subscription: subscription._id,
            amountPaid: subscription.plan.basePrice,
            refundAmount,
            status:
                refundAmount === subscription.plan.basePrice
                    ? "refunded"
                    : "cancelled",
        });

        res.json({
            message:
                diffMinutes <= 60
                    ? "Subscription cancelled with full refund"
                    : "Subscription cancelled with partial refund",
            refundAmount,
            penalty,
        });
    } catch (err) {
        console.error("CANCEL SUBSCRIPTION ERROR:", err);
        res.status(500).json({
            message: "Failed to cancel subscription",
        });
    }
});

/* =========================
   SUBSCRIBE TO PLAN (DIRECT)
========================= */
router.post("/subscribe", protect, async (req, res) => {
    try {
        const { planId, customizations } = req.body;

        if (!planId) {
            return res.status(400).json({ message: "Plan ID is required" });
        }

        const existing = await UserSubscription.findOne({
            user: req.userId,
            status: "active",
        });

        if (existing) {
            return res.status(409).json({
                message: "You already have an active subscription",
            });
        }

        const plan = await SubscriptionPlan.findById(planId);
        if (!plan) {
            return res.status(404).json({ message: "Plan not found" });
        }

        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + plan.durationDays);

        const subscription = await UserSubscription.create({
            user: req.userId,
            plan: plan._id,
            startDate,
            endDate,
            status: "active",
            customizations,
        });

        res.status(201).json({
            message: "Subscription activated successfully",
            subscription,
        });
    } catch {
        res.status(500).json({ message: "Subscription failed" });
    }
});

export default router;
