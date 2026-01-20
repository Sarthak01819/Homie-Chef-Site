import cron from "node-cron";
import User from "../models/User.js";

/*
  Runs every day at 03:00 AM
  Cleans expired refresh tokens from DB
*/
export const startRefreshTokenCleanup = () => {
    cron.schedule("0 3 * * *", async () => {
        try {
            const EXPIRY_DAYS = 14;
            const expiryDate = new Date(
                Date.now() - EXPIRY_DAYS * 24 * 60 * 60 * 1000
            );

            const result = await User.updateMany(
                {},
                {
                    $pull: {
                        refreshTokens: {
                            createdAt: { $lt: expiryDate },
                        },
                    },
                }
            );

            console.log(
                `[CRON] Refresh token cleanup done | Modified users: ${result.modifiedCount}`
            );
        } catch (err) {
            console.error("[CRON] Refresh token cleanup failed:", err);
        }
    });
};
