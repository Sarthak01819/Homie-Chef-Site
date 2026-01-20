import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import { sendEmail } from "../utils/sendEmail.js";
import { generateCsrfToken } from "../middleware/csrf.js";
import { logAudit } from "../utils/logAudit.js";
import {
  authLimiter,
  refreshLimiter,
  passwordLimiter,
  adminAuthLimiter,
} from "../middleware/rateLimiters.js";

const router = express.Router();
const IS_PROD = process.env.APP_MODE === "production";

/* =========================
   COOKIE OPTIONS (SECURE)
========================= */
const userCookieOptions = {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: IS_PROD ? "none" : "lax",
    path: "/", // 👈 user scope
};

const adminCookieOptions = {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: IS_PROD ? "none" : "lax",
    path: "/admin", // 👈 admin isolation
};

/* =========================
   EMAIL VERIFICATION
========================= */
router.get("/verify-email/:token", async (req, res) => {
    try {
        const user = await User.findOne({ emailVerifyToken: req.params.token });
        if (!user) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        user.isVerified = true;
        user.emailVerifyToken = undefined;
        await user.save();

        res.json({ message: "Email verified successfully" });
    } catch {
        res.status(500).json({ message: "Verification failed" });
    }
});

/* =========================
   REGISTER
========================= */
router.post("/register", async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (phone && !/^[6-9]\d{9}$/.test(phone)) {
            return res.status(400).json({ message: "Invalid Indian phone number" });
        }

        const existingUser = await User.findOne({
            $or: [{ email }, ...(phone ? [{ phone }] : [])],
        });

        if (existingUser) {
            return res.status(409).json({
                message: "Email or phone already registered",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({
            name,
            email,
            password: hashedPassword,
            phone: phone || undefined,
        });

        res.status(201).json({ message: "Registration successful" });
    } catch (err) {
        console.error("REGISTER ERROR:", err);
        res.status(500).json({ message: "Registration failed" });
    }
});

/* =========================
   LOGIN (WITH ROTATION SETUP)
========================= */
router.post("/login", authLimiter,async (req, res) => {
    const { email, password } = req.body;

    try {
        /* =========================
           VALIDATION
        ========================= */
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        if (IS_PROD && !user.isVerified) {
            return res.status(403).json({
                message: "Please verify your email before logging in",
            });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        /* =========================
           TOKEN GENERATION
        ========================= */
        const accessToken = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "30m" }
        );

        const refreshToken = jwt.sign(
            { id: user._id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: "14d" }
        );

        /* =========================
           SESSION TRACKING
        ========================= */
        if (!Array.isArray(user.refreshTokens)) {
            user.refreshTokens = [];
        }

        user.refreshTokens.push({
            token: refreshToken,
            ip: req.ip,
            userAgent: req.headers["user-agent"],
            createdAt: new Date(),
        });

        await user.save();

        /* =========================
           CSRF TOKEN
        ========================= */
        const csrfToken = generateCsrfToken();

        /* =========================
           COOKIES + RESPONSE
        ========================= */
        res
            .cookie("token", accessToken, userCookieOptions)
            .cookie("refreshToken", refreshToken, userCookieOptions)
            .cookie("csrfToken", csrfToken, {
                httpOnly: false, // ✅ frontend must read
                secure: IS_PROD,
                sameSite: IS_PROD ? "none" : "lax",
            })
            .json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            });

        /* =========================
           AUDIT LOG (NON-BLOCKING)
        ========================= */
        logAudit({
            event: "USER_LOGIN_SUCCESS",
            userId: user._id,
            role: "user",
            req,
        }).catch(() => { });

    } catch (err) {
        console.error("LOGIN ERROR:", err);

        res.status(500).json({ message: "Login failed" });

        logAudit({
            event: "USER_LOGIN_FAILED",
            role: "user",
            req,
            metadata: { email },
        }).catch(() => { });
    }
});

/* =========================
   REFRESH TOKEN (ROTATION)
========================= */
router.post("/refresh", refreshLimiter, async (req, res) => {
    const oldToken = req.cookies.refreshToken;

    try {
        /* =========================
           NO REFRESH TOKEN
        ========================= */
        if (!oldToken) {
            return res.sendStatus(401);
        }

        /* =========================
           VERIFY REFRESH TOKEN
        ========================= */
        const decoded = jwt.verify(
            oldToken,
            process.env.JWT_REFRESH_SECRET
        );

        const user = await User.findById(decoded.id);
        if (!user) {
            return res.sendStatus(403);
        }

        if (IS_PROD && !user.isVerified) {
            return res.sendStatus(403);
        }

        /* =========================
           TOKEN REUSE DETECTION
        ========================= */
        const exists = user.refreshTokens?.find(
            (t) => t.token === oldToken
        );

        if (!exists) {
            // 🚨 Possible token theft → revoke all
            user.refreshTokens = [];
            await user.save();

            logAudit({
                event: "REFRESH_TOKEN_REUSE_DETECTED",
                userId: user._id,
                role: "system",
                req,
            }).catch(() => { });

            return res.sendStatus(403);
        }

        /* =========================
           ROTATE TOKENS
        ========================= */
        user.refreshTokens = user.refreshTokens.filter(
            (t) => t.token !== oldToken
        );

        const newAccessToken = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "30m" }
        );

        const newRefreshToken = jwt.sign(
            { id: user._id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: "14d" }
        );

        user.refreshTokens.push({
            token: newRefreshToken,
            ip: req.ip,
            userAgent: req.headers["user-agent"],
            createdAt: new Date(),
        });

        await user.save();

        /* =========================
           CSRF TOKEN
        ========================= */
        const csrfToken = generateCsrfToken();

        /* =========================
           SET COOKIES
        ========================= */
        res
            .cookie("token", newAccessToken, userCookieOptions)
            .cookie("refreshToken", newRefreshToken, userCookieOptions)
            .cookie("csrfToken", csrfToken, {
                httpOnly: false, // frontend must read
                secure: IS_PROD,
                sameSite: IS_PROD ? "none" : "lax",
            })
            .sendStatus(200);

        /* =========================
           AUDIT LOG (NON-BLOCKING)
        ========================= */
        logAudit({
            event: "REFRESH_TOKEN_ROTATED",
            userId: user._id,
            role: "user",
            req,
        }).catch(() => { });

    } catch (err) {
        console.error("REFRESH ERROR:", err);

        // ⚠️ Never crash refresh because of logging
        logAudit({
            event: "REFRESH_FAILED",
            role: "system",
            req,
            metadata: { reason: err.message },
        }).catch(() => { });

        res.sendStatus(403);
    }
});

/* =========================
   LOGOUT (INVALIDATE REFRESH)
========================= */
router.post("/logout", async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    let userId = null;

    // 🔍 Safely extract userId from refresh token (since route is unprotected)
    try {
        if (refreshToken) {
            const decoded = jwt.verify(
                refreshToken,
                process.env.JWT_REFRESH_SECRET
            );
            userId = decoded.id;
        }
    } catch {
        // ignore token errors during logout
    }

    // ❌ Remove only this device's refresh token
    if (refreshToken) {
        await User.updateOne(
            { "refreshTokens.token": refreshToken },
            { $pull: { refreshTokens: { token: refreshToken } } }
        );
    }

    // 📝 Audit log (now correctly attributed)
    await logAudit({
        event: "USER_LOGOUT",
        userId,
        role: "user",
        req,
    });

    // 🍪 Clear cookies
    res.clearCookie("token", userCookieOptions);
    res.clearCookie("refreshToken", userCookieOptions);
    res.clearCookie("csrfToken");

    res.json({ message: "Logged out" });
});

/* =========================
   LOGOUT FROM OTHER DEVICES
========================= */
router.post("/logout-others", async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) return res.sendStatus(401);

        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) return res.sendStatus(403);

        user.refreshTokens = user.refreshTokens.filter(
            t => t.token === refreshToken
        );

        await logAudit({
            event: "USER_LOGOUT_OTHERS",
            userId: user._id,
            role: "user",
            req,
        });

        await user.save();
        res.json({ message: "Logged out from other devices" });
    } catch {
        res.sendStatus(403);
    }
});

/* =========================
   GET CURRENT USER
========================= */
router.get("/me", async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) return res.status(401).json(null);

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("-password");

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
        });
    } catch {
        res.status(401).json(null);
    }
});

/* =========================
   GET ACTIVE SESSIONS
========================= */
router.get("/sessions", async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) return res.json([]);

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        res.json(
            user.refreshTokens.map(s => ({
                ip: s.ip,
                userAgent: s.userAgent,
                createdAt: s.createdAt,
            }))
        );
    } catch {
        res.json([]);
    }
});

/* =========================
   FORGOT PASSWORD
========================= */
router.post("/forgot-password", passwordLimiter, async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.json({
                message: "If the email exists, a reset link has been sent",
            });
        }

        const token = crypto.randomBytes(32).toString("hex");

        user.resetPasswordToken = token;
        user.resetPasswordExpiry = Date.now() + 15 * 60 * 1000;
        await user.save();

        const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;

        if (IS_PROD) {
            await sendEmail(
                user.email,
                "Reset your Homie Chef password",
                `<a href="${resetLink}">${resetLink}</a>`
            );
        }

        res.json({
            message: IS_PROD
                ? "Reset link sent to your email"
                : "Reset token generated (DEV MODE)",
        });
    } catch {
        res.status(500).json({ message: "Password reset failed" });
    }
});

/* =========================
   RESET PASSWORD
========================= */
router.post("/reset-password/:token", async (req, res) => {
    try {
        const { password } = req.body;
        if (!password) {
            return res.status(400).json({ message: "Password required" });
        }

        const user = await User.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpiry: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({
                message: "Invalid or expired reset token",
            });
        }

        user.password = await bcrypt.hash(password, 10);

        // 🔐 Mark password change time
        user.passwordChangedAt = new Date();

        // 🚪 Force logout from ALL devices
        user.refreshTokens = [];

        user.resetPasswordToken = undefined;
        user.resetPasswordExpiry = undefined;

        await user.save();


        res.json({ message: "Password reset successful" });

        await logAudit({
            event: "PASSWORD_RESET",
            userId: user._id,
            role: "user",
            req,
        });

    } catch {
        res.status(500).json({ message: "Reset failed" });
    }
});

/* =========================
   ADMIN LOGIN (ISOLATED)
========================= */
router.post("/admin/login", adminAuthLimiter, async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email, role: "admin" });
        if (!user) {
            return res.status(403).json({ message: "Admin access only" });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const accessToken = jwt.sign(
            { id: user._id, role: "admin" },
            process.env.JWT_SECRET,
            { expiresIn: "30m" }
        );

        const refreshToken = jwt.sign(
            { id: user._id, role: "admin" },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: "14d" }
        );

        // ✅ ENSURE ADMIN SESSION ARRAY
        if (!user.adminRefreshTokens) {
            user.adminRefreshTokens = [];
        }

        user.adminRefreshTokens.push({
            token: refreshToken,
            ip: req.ip,
            userAgent: req.headers["user-agent"],
            createdAt: new Date(),
        });

        await user.save();

        res
            .cookie("admin_token", accessToken, adminCookieOptions)
            .cookie("admin_refreshToken", refreshToken, adminCookieOptions)
            .json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            });

        // 🔐 Audit log (safe)
        logAudit({
            event: "ADMIN_LOGIN_SUCCESS",
            userId: user._id,
            role: "admin",
            req,
        }).catch(() => { });

    } catch (err) {
        console.error("ADMIN LOGIN ERROR:", err);

        logAudit({
            event: "ADMIN_LOGIN_FAILED",
            role: "admin",
            req,
            metadata: { email: req.body?.email },
        }).catch(() => { });

        res.status(500).json({ message: "Admin login failed" });
    }
});

/* =========================
   ADMIN REFRESH (ISOLATED)
========================= */
router.post("/admin/refresh", async (req, res) => {
    try {
        const oldToken = req.cookies.admin_refreshToken;
        if (!oldToken) return res.sendStatus(401);

        const decoded = jwt.verify(
            oldToken,
            process.env.JWT_REFRESH_SECRET
        );

        if (decoded.role !== "admin") {
            return res.sendStatus(403);
        }

        const user = await User.findById(decoded.id);
        if (!user || !user.adminRefreshTokens) {
            return res.sendStatus(403);
        }

        const tokenExists = user.adminRefreshTokens.find(
            (t) => t.token === oldToken
        );

        // 🚨 TOKEN REUSE DETECTED
        if (!tokenExists) {
            user.adminRefreshTokens = [];
            await user.save();

            logAudit({
                event: "ADMIN_REFRESH_REUSE_DETECTED",
                userId: user._id,
                role: "admin",
                req,
            }).catch(() => { });

            return res.sendStatus(403);
        }

        // 🔄 ROTATE TOKENS
        user.adminRefreshTokens = user.adminRefreshTokens.filter(
            (t) => t.token !== oldToken
        );

        const newAccessToken = jwt.sign(
            { id: user._id, role: "admin" },
            process.env.JWT_SECRET,
            { expiresIn: "30m" }
        );

        const newRefreshToken = jwt.sign(
            { id: user._id, role: "admin" },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: "14d" }
        );

        user.adminRefreshTokens.push({
            token: newRefreshToken,
            ip: req.ip,
            userAgent: req.headers["user-agent"],
            createdAt: new Date(),
        });

        await user.save();

        res
            .cookie("admin_token", newAccessToken, adminCookieOptions)
            .cookie("admin_refreshToken", newRefreshToken, adminCookieOptions)
            .sendStatus(200);

        logAudit({
            event: "ADMIN_REFRESH_ROTATED",
            userId: user._id,
            role: "admin",
            req,
        }).catch(() => { });

    } catch (err) {
        console.error("ADMIN REFRESH ERROR:", err);

        logAudit({
            event: "ADMIN_REFRESH_FAILED",
            role: "system",
            req,
            metadata: { error: err.message },
        }).catch(() => { });

        res.sendStatus(403);
    }
});

router.post("/admin/logout", async (req, res) => {
    const refreshToken = req.cookies.admin_refreshToken;

    try {
        if (refreshToken) {
            await User.updateOne(
                { "adminRefreshTokens.token": refreshToken },
                { $pull: { adminRefreshTokens: { token: refreshToken } } }
            );
        }
    } catch (err) {
        console.error("ADMIN LOGOUT ERROR:", err);
    }

    res.clearCookie("admin_token", adminCookieOptions);
    res.clearCookie("admin_refreshToken", adminCookieOptions);
    
    res.json({ message: "Admin logged out" });
});

/* =========================
   CHANGE PASSWORD (SECURE)
========================= */
router.post("/change-password", async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) return res.sendStatus(401);

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) return res.sendStatus(403);

        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: "All fields required" });
        }

        const match = await bcrypt.compare(currentPassword, user.password);
        if (!match) {
            return res.status(401).json({ message: "Current password incorrect" });
        }

        // 🔐 Update password
        user.password = await bcrypt.hash(newPassword, 10);

        // 🔥 INVALIDATE ALL SESSIONS
        user.refreshTokens = [];

        user.passwordChangedAt = new Date();
        await user.save();

        // Clear cookies
        res.clearCookie("token", userCookieOptions);
        res.clearCookie("refreshToken", userCookieOptions);

        res.json({
            message: "Password changed. Please log in again on all devices.",
        });

        await logAudit({
            event: "PASSWORD_CHANGED",
            userId: user._id,
            role: "user",
            req,
        });


    } catch (err) {
        console.error("CHANGE PASSWORD ERROR:", err);
        res.status(500).json({ message: "Password change failed" });
    }
});

export default router;
