import mongoose from "mongoose";

const customizationSchema = new mongoose.Schema(
    {
        exclusions: {
            type: [String], // onion, garlic, etc.
            default: [],
        },

        spiceLevel: {
            type: String,
            enum: ["low", "medium", "high"],
            default: "medium",
        },

        notes: {
            type: String,
        },
    },
    { _id: false }
);

const userSubscriptionSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        plan: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SubscriptionPlan",
            required: true,
        },

        startDate: {
            type: Date,
            required: true,
        },

        endDate: {
            type: Date,
            required: true,
        },

        status: {
            type: String,
            enum: ["active", "cancelled", "expired"],
            default: "active",
        },

        /* =========================
           REFUND & CANCELLATION
        ========================= */
        cancelledAt: {
            type: Date,
            default: null,
        },

        refundAmount: {
            type: Number,
            default: 0,
        },

        cancellationPenalty: {
            type: Number,
            default: 0,
        },

        refundStatus: {
            type: String,
            enum: ["none", "pending", "processed"],
            default: "none",
        },

        customizations: {
            exclusions: [String],
            spiceLevel: String,
            notes: String,
        },
    },
    { timestamps: true }
);

export default mongoose.model("UserSubscription", userSubscriptionSchema);
