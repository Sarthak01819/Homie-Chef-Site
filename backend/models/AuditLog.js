import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
    {
        /* =========================
           WHO
        ========================= */
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null, // null for unauthenticated events
        },

        role: {
            type: String,
            enum: ["user", "admin", "system"],
            default: "user",
        },

        /* =========================
           WHAT
        ========================= */
        event: {
            type: String,
            required: true,
            index: true,
        },

        /* =========================
           CONTEXT
        ========================= */
        ip: {
            type: String,
            required: true,
        },

        userAgent: {
            type: String,
            default: "",
        },

        /* =========================
           EXTRA INFO (OPTIONAL)
        ========================= */
        metadata: {
            type: Object,
            default: {},
        },

        /* =========================
           TIME
        ========================= */
        createdAt: {
            type: Date,
            default: Date.now,
            index: true,
        },
    },
    {
        versionKey: false,
    }
);

/* =========================
   INDEXES (IMPORTANT)
========================= */
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ event: 1, createdAt: -1 });

export default mongoose.model("AuditLog", auditLogSchema);
