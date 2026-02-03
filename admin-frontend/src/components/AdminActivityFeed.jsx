import { motion } from "framer-motion";
import { useAdminRealtime } from "../context/AdminRealtimeContext";

const format = (event) => {
    const map = {
        MEAL_DELIVERED: "🍽 Meal delivered",
        SUB_PAUSED: "⏸ Subscription paused",
        SUB_RESUMED: "▶️ Subscription resumed",
        SUB_CANCELLED: "❌ Subscription cancelled",
        CUSTOMIZATION_REQUEST: "📝 Customization requested",
        FORCE_LOGOUT: "🔒 User force logged out",
    };
    return map[event.type] || event.type;
};

export default function AdminActivityFeed() {
    const { activity } = useAdminRealtime();

    return (
        <div className="rounded-xl bg-white shadow p-4">
            <h3 className="font-semibold mb-3">
                Live Activity
            </h3>

            <div className="space-y-2 max-h-96 overflow-y-auto">
                {activity.map((a) => (
                    <motion.div
                        key={a.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm p-2 rounded bg-slate-100"
                    >
                        {format(a)} •{" "}
                        <span className="text-xs text-gray-500">
                            {a.time.toLocaleTimeString()}
                        </span>
                    </motion.div>
                ))}

                {activity.length === 0 && (
                    <p className="text-sm text-gray-500">
                        Waiting for activity…
                    </p>
                )}
            </div>
        </div>
    );
}
