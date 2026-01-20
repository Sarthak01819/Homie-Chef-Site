import express from "express";
import Razorpay from "razorpay";
import { protect } from "../middleware/auth.js";
import Order from "../models/Order.js";
import User from "../models/User.js";

const router = express.Router();

/* =====================================================
   LEGACY: PLACE ORDER (KEPT FOR BACKWARD COMPATIBILITY)
===================================================== */
router.post("/", protect, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate("cart.meal");

    if (!user || user.cart.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const items = user.cart.map((item) => ({
      meal: item.meal._id,
      name: item.meal.name,
      price: item.meal.price,
      quantity: item.quantity,
    }));

    const totalAmount = items.reduce(
      (sum, i) => sum + i.price * i.quantity,
      0
    );

    const order = await Order.create({
      user: user._id,
      type: "meal",
      items,
      amountPaid: totalAmount,
      status: "paid",
    });

    user.cart = [];
    await user.save();

    res.status(201).json({
      message: "Order placed successfully",
      orderId: order._id,
    });
  } catch (error) {
    console.error("LEGACY ORDER ERROR:", error);
    res.status(500).json({ message: "Failed to place order" });
  }
});

/* =========================
   GET USER ORDERS (FILTERED)
========================= */
router.get("/", protect, async (req, res) => {
  try {
    const { type } = req.query;

    const filter = { user: req.userId };
    if (type) filter.type = type;

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .populate("items.meal")
      .populate("subscription");

    res.json(orders);
  } catch (err) {
    console.error("FETCH ORDERS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

/* =========================
   LEGACY: ORDER HISTORY
========================= */
router.get("/history", protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .populate("items.meal")
      .populate("subscription");

    res.json(orders);
  } catch {
    res.status(500).json({ message: "Failed to fetch order history" });
  }
});

/* =========================
   CANCEL MEAL ORDER + REFUND
========================= */
router.post("/:orderId/cancel", protect, async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.user.toString() !== req.userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (order.type !== "meal") {
      return res
        .status(400)
        .json({ message: "Only meal orders can be cancelled" });
    }

    if (order.status !== "paid") {
      return res
        .status(400)
        .json({ message: "Order already cancelled or refunded" });
    }

    /* ⏱ Time-based refund logic */
    const now = Date.now();
    const createdAt = new Date(order.createdAt).getTime();
    const diffSeconds = (now - createdAt) / 1000;

    let refundAmount = 0;

    if (diffSeconds <= 90) {
      refundAmount = order.amountPaid;
    } else {
      const cancellationFee = Math.round(order.amountPaid * 0.2);
      refundAmount = order.amountPaid - cancellationFee;
    }

    /* 💸 Razorpay refund (SAFE INIT) */
    let finalStatus = "cancelled";

    if (refundAmount > 0 && order.paymentId) {
      if (
        !process.env.RAZORPAY_KEY_ID ||
        !process.env.RAZORPAY_KEY_SECRET
      ) {
        return res.status(500).json({
          message: "Refund service unavailable (missing Razorpay keys)",
        });
      }

      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });

      await razorpay.payments.refund(order.paymentId, {
        amount: refundAmount * 100, // paise
      });

      finalStatus = "refunded";
    }

    order.status = finalStatus;
    order.refundAmount = refundAmount;
    order.cancelledAt = new Date();

    await order.save();

    res.json({
      message: "Order cancelled successfully",
      refundAmount,
      status: finalStatus,
    });
  } catch (err) {
    console.error("CANCEL ORDER ERROR:", err);
    res.status(500).json({ message: "Failed to cancel order" });
  }
});

export default router;
