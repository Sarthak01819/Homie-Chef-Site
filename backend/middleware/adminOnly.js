import User from "../models/User.js";

const adminOnly = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId).select("role");

        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        if (user.role !== "admin") {
            return res.status(403).json({ message: "Admin access only" });
        }

        next();
    } catch (err) {
        console.error("ADMIN MIDDLEWARE ERROR:", err);
        res.status(500).json({ message: "Authorization failed" });
    }
};

export default adminOnly;
