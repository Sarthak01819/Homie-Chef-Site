import mongoose from "mongoose";

/* =========================
   REFRESH TOKEN SUB-SCHEMA
========================= */
const refreshTokenSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
    },
    ip: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    /* =========================
       BASIC INFO
    ========================= */
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },

    password: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      unique: true,
      sparse: true,
      match: [/^[6-9]\d{9}$/, "Invalid Indian phone number"],
    },

    /* =========================
       ROLE & ACCESS
    ========================= */
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    /* =========================
       EMAIL VERIFICATION
    ========================= */
    isVerified: {
      type: Boolean,
      default: false,
    },

    emailVerifyToken: {
      type: String,
      default: null,
    },

    /* =========================
       PASSWORD RESET
    ========================= */
    resetPasswordToken: {
      type: String,
      default: null,
    },

    resetPasswordExpiry: {
      type: Date,
      default: null,
    },

    /* =========================
       MULTI-DEVICE SESSIONS ✅
    ========================= */
    refreshTokens: {
      type: [refreshTokenSchema],
      default: [], // 🔑 CRITICAL
    },

    /* =========================
       ADMIN SESSIONS (ISOLATED)
    ========================= */
    adminRefreshTokens: {
      type: [refreshTokenSchema],
      default: [],
    },

    /* =========================
       LOGIN SECURITY (FUTURE)
    ========================= */
    lastLoginAt: {
      type: Date,
      default: null,
    },

    loginAttempts: {
      type: Number,
      default: 0,
    },

    lockUntil: {
      type: Date,
      default: null,
    },

    passwordChangedAt: {
      type: Date,
    },

    /* =========================
       CART
    ========================= */
    cart: [
      {
        meal: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Meal",
          required: true,
        },
        quantity: {
          type: Number,
          default: 1,
          min: 1,
        },
      },
    ],

    /* =========================
       USER DATA
    ========================= */
    favourites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Meal",
      },
    ],

    ratings: [
      {
        mealId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Meal",
        },
        rating: {
          type: Number,
          min: 1,
          max: 5,
        },
      },
    ],

    mealHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Meal",
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
