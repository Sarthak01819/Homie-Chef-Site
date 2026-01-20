import User from "../models/User.js";

export const adminProtect = async (req, res, next) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ message: "Not authenticated" });
        }

        const user = await User.findById(req.userId);

        if (!user || user.role !== "admin") {
            return res.status(403).json({ message: "Admin access only" });
        }

        req.admin = user;
        next();
    } catch (err) {
        console.error("ADMIN AUTH ERROR:", err);
        res.status(500).json({ message: "Admin authorization failed" });
    }
};
