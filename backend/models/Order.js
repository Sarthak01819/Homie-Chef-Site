import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 🔁 meal | subscription
    type: {
      type: String,
      enum: ["meal", "subscription"],
      required: true,
    },

    /* =========================
       MEAL ORDER DATA
    ========================= */
    items: [
      {
        meal: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Meal",
        },
        name: {
          type: String, // snapshot (important if meal changes later)
        },
        quantity: {
          type: Number,
          required: true,
        },
        price: {
          type: Number, // price at time of order
          required: true,
        },
      },
    ],

    /* =========================
       SUBSCRIPTION ORDER DATA
    ========================= */
    subscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserSubscription",
    },

    /* =========================
       PAYMENT INFO
    ========================= */
    amountPaid: {
      type: Number,
      required: true,
    },

    paymentId: {
      type: String, // Razorpay payment id
    },

    refundAmount: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["paid", "cancelled", "refunded"],
      default: "paid",
    },

    cancelledAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
