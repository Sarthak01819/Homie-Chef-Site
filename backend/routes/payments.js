import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import SubscriptionPlan from "../models/SubscriptionPlan.js";
import UserSubscription from "../models/UserSubscription.js";
import Order from "../models/Order.js";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

/* =========================
   CREATE MEAL PAYMENT ORDER
========================= */
router.post("/create-meal-order", protect, async (req, res) => {
    try {
        const { items } = req.body;

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: "Cart is empty" });
        }

        // 🔐 Server-side price calculation (authoritative)
        const itemsTotal = items.reduce(
            (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
            0
        );

        const gst = Math.round(itemsTotal * 0.18);
        const deliveryCharge = 49;
        const grandTotal = itemsTotal + gst + deliveryCharge;

        // ✅ CREATE Razorpay INSIDE ROUTE
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        const order = await razorpay.orders.create({
            amount: grandTotal * 100,
            currency: "INR",
            receipt: `meal_${Date.now()}`,
        });

        res.json({
            orderId: order.id,
            amount: order.amount,
            currency: "INR",
            breakdown: {
                itemsTotal,
                gst,
                deliveryCharge,
                grandTotal,
            },
        });
    } catch (err) {
        console.error("CREATE MEAL ORDER ERROR:", err);
        res.status(500).json({ message: "Failed to create meal order" });
    }
});
/* =========================
   CREATE SUBSCRIPTION ORDER
========================= */
router.post("/create-order", protect, async (req, res) => {
    try {
        const { planId } = req.body;

        const plan = await SubscriptionPlan.findById(planId);
        if (!plan) {
            return res.status(404).json({ message: "Plan not found" });
        }

        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        const order = await razorpay.orders.create({
            amount: plan.basePrice * 100,
            currency: "INR",
            receipt: `sub_${plan._id.toString().slice(-8)}`,
        });

        res.json({
            orderId: order.id,
            amount: order.amount,
            currency: "INR",
            planName: plan.name,
        });
    } catch (err) {
        console.error("SUB ORDER ERROR:", err);
        res.status(500).json({ message: "Failed to create subscription order" });
    }
});

/* =========================
   VERIFY SUBSCRIPTION PAYMENT
========================= */
router.post("/verify", protect, async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            planId,
            customizations,
        } = req.body;

        const body = `${razorpay_order_id}|${razorpay_payment_id}`;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ message: "Payment verification failed" });
        }

        const existing = await UserSubscription.findOne({
            user: req.userId,
            status: "active",
        });

        if (existing) {
            return res.status(409).json({
                message: "Active subscription already exists",
            });
        }

        const plan = await SubscriptionPlan.findById(planId);

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

        await Order.create({
            user: req.userId,
            type: "subscription",
            subscription: subscription._id,
            amountPaid: plan.basePrice,
            status: "paid",
        });

        res.json({
            message: "Subscription activated",
            subscription,
        });
    } catch (err) {
        console.error("VERIFY SUB ERROR:", err);
        res.status(500).json({ message: "Subscription verification failed" });
    }
});

/* =========================
   VERIFY MEAL PAYMENT
========================= */
router.post("/verify-meal", protect, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    /* 1️⃣ Verify Razorpay signature */
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Payment verification failed" });
    }

    /* 2️⃣ Fetch user cart from DB */
    const user = await User.findById(req.userId).populate("cart.meal");

    if (!user || !Array.isArray(user.cart) || user.cart.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    /* 3️⃣ Build order items SAFELY */
    const items = user.cart.map((item) => ({
      meal: item.meal._id,
      name: item.meal.name,
      price: item.meal.price,
      quantity: item.quantity,
    }));

    /* 4️⃣ Server-side amount calculation */
    const itemsTotal = items.reduce(
      (sum, i) => sum + i.price * i.quantity,
      0
    );

    const gst = Math.round(itemsTotal * 0.18);
    const deliveryCharge = 49;
    const grandTotal = itemsTotal + gst + deliveryCharge;

    /* 5️⃣ Save order */
    const order = await Order.create({
      user: user._id,
      type: "meal",
      items,
      amountPaid: grandTotal,
      paymentId: razorpay_payment_id,
      status: "paid",
    });

    /* 6️⃣ Clear cart */
    user.cart = [];
    await user.save();

    res.status(201).json({
      message: "Meal order placed successfully",
      order,
    });
  } catch (err) {
    console.error("VERIFY MEAL ERROR:", err);
    res.status(500).json({ message: "Meal payment verification failed" });
  }
});

export default router;
