import { useEffect, useState } from "react";
import Loader from "../components/Loader";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";

const ActiveSubscription = () => {
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(null);

    const [showCancelModal, setShowCancelModal] = useState(false);
    const [selectedSub, setSelectedSub] = useState(null);
    const [cancelling, setCancelling] = useState(false);
    const [error, setError] = useState(null);

    /* =========================
       FETCH SUBSCRIPTIONS
    ========================= */
    useEffect(() => {
        const fetchSubscriptions = async () => {
            try {
                const res = await fetch(
                    `${import.meta.env.VITE_API_URL}/subscriptions/my`,
                    { credentials: "include" }
                );

                if (!res.ok) {
                    setSubscriptions([]);
                    return;
                }

                const data = await res.json();

                const list = Array.isArray(data)
                    ? data.filter(Boolean)
                    : data
                        ? [data]
                        : [];

                setSubscriptions(
                    list.sort((a, b) => new Date(b.endDate) - new Date(a.endDate))
                );
            } catch {
                toast.error("Failed to load subscriptions");
            } finally {
                setLoading(false);
            }
        };

        fetchSubscriptions();
    }, []);

    /* =========================
       CANCEL SUBSCRIPTION
    ========================= */
    const handleCancelSubscription = async () => {
        if (!selectedSub) return;

        setCancelling(true);

        try {
            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/subscriptions/cancel`,
                {
                    method: "POST",
                    credentials: "include",
                }
            );

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.message || "Cancellation failed");
                return;
            }

            toast.success(data.message);
            setShowCancelModal(false);

            setTimeout(() => {
                window.location.reload();
            }, 1200);
        } catch {
            toast.error("Something went wrong");
        } finally {
            setCancelling(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-5xl mx-auto px-4 py-8 mt-20 space-y-6">
                {[1, 2].map((i) => (
                    <div
                        key={i}
                        className="bg-white rounded-2xl shadow-md p-6 space-y-3"
                    >
                        <div className="h-5 w-48 bg-gray-200 rounded" />
                        <div className="h-4 w-32 bg-gray-200 rounded" />
                        <div className="h-4 w-40 bg-gray-200 rounded" />
                        <div className="h-9 w-32 bg-gray-200 rounded-xl mt-3" />
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <ErrorState
                type={error.type}
                message={error.message}
                onRetry={() => {
                    setLoading(true);
                    fetchSubscriptions();
                }}
            />
        );
    }

    const now = Date.now();
    const filtered = subscriptions;

    return (
        <motion.div
            className="max-w-5xl mx-auto px-4 py-8 mt-20 min-h-[80vh] bg-green-100/50 rounded-2xl shadow-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <motion.h1
                className="text-3xl font-bold text-center mb-6"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
            >
                Active Subscription
            </motion.h1>

            {/* Empty State */}
            {filtered.length === 0 ? (
                <EmptyState
                    icon="🥗"
                    title="No active subscription"
                    description="Subscribe to a vegetarian meal plan and enjoy healthy, home-style food every day."
                    actionLabel="Browse Plans"
                    actionTo="/subscription"
                />
            ) : (
                <motion.div
                    className="space-y-6"
                    initial="hidden"
                    animate="visible"
                    variants={{
                        hidden: {},
                        visible: {
                            transition: { staggerChildren: 0.12 },
                        },
                    }}
                >
                    {filtered.map((sub) => {
                        const isActive = new Date(sub.endDate).getTime() > now;

                        return (
                            <motion.div
                                key={sub._id}
                                className="bg-white rounded-2xl shadow-md p-6"
                                variants={{
                                    hidden: { opacity: 0, y: 16 },
                                    visible: { opacity: 1, y: 0 },
                                }}
                                whileHover={{ y: -3 }}
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <h2 className="text-xl font-semibold">
                                        {sub.plan?.name} •{" "}
                                        {sub.plan?.category?.replace("-", " ").toUpperCase()}
                                    </h2>

                                    <span
                                        className={`px-3 py-1 text-sm rounded-full ${isActive
                                            ? "bg-green-100 text-green-700"
                                            : "bg-red-100 text-red-700"
                                            }`}
                                    >
                                        {isActive ? "Active" : "Expired"}
                                    </span>
                                </div>

                                <p className="text-sm text-gray-600 mb-2">
                                    {new Date(sub.startDate).toLocaleDateString()} →{" "}
                                    {new Date(sub.endDate).toLocaleDateString()}
                                </p>

                                <p className="text-sm mb-3">
                                    Price: ₹{sub.plan?.basePrice}
                                </p>

                                {/* Customizations */}
                                <div className="text-sm text-gray-700 mb-3">
                                    <p>
                                        <strong>Spice:</strong>{" "}
                                        {sub.customizations?.spiceLevel || "medium"}
                                    </p>
                                    <p>
                                        <strong>Excluded:</strong>{" "}
                                        {sub.customizations?.exclusions?.length
                                            ? sub.customizations.exclusions.join(", ")
                                            : "None"}
                                    </p>
                                </div>

                                {/* Meals Dropdown */}
                                <motion.button
                                    onClick={() =>
                                        setExpanded(expanded === sub._id ? null : sub._id)
                                    }
                                    className="flex items-center gap-2 text-sm text-green-600"
                                    whileTap={{ scale: 0.97 }}
                                >
                                    {expanded === sub._id ? (
                                        <>
                                            Hide Plan <ChevronUp size={16} />
                                        </>
                                    ) : (
                                        <>
                                            View Plan <ChevronDown size={16} />
                                        </>
                                    )}
                                </motion.button>

                                <AnimatePresence>
                                    {expanded === sub._id && (
                                        <motion.div
                                            className="mt-3 space-y-2 text-sm"
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            {sub.plan?.mealsByDay?.map(({ day, meal }) => {
                                                const macros = meal?.macros || {};
                                                return (
                                                    <motion.div
                                                        key={day}
                                                        className="border rounded-xl py-2 px-3"
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                    >
                                                        <p className="font-medium mb-1">
                                                            {day} — {meal?.name}
                                                        </p>
                                                        <p className="text-gray-600">
                                                            Calories: {macros.calories ?? "N/A"} • Protein:{" "}
                                                            {macros.protein ?? "N/A"}g • Carbs:{" "}
                                                            {macros.carbs ?? "N/A"}g • Fats:{" "}
                                                            {macros.fats ?? "N/A"}g
                                                        </p>
                                                    </motion.div>
                                                );
                                            })}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Cancel Button */}
                                {isActive && (
                                    <motion.button
                                        onClick={() => {
                                            setSelectedSub(sub);
                                            setShowCancelModal(true);
                                        }}
                                        className="mt-4 px-5 py-2 rounded-xl border border-red-500 text-red-600 hover:bg-red-50 transition"
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.97 }}
                                    >
                                        Cancel Subscription
                                    </motion.button>
                                )}
                            </motion.div>
                        );
                    })}
                </motion.div>
            )}

            {/* CANCEL MODAL */}
            <AnimatePresence>
                {showCancelModal && (
                    <motion.div
                        className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-lg"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                        >
                            <h3 className="text-xl font-semibold mb-3 text-red-600">
                                Cancel Subscription?
                            </h3>

                            <p className="text-sm text-gray-700 mb-3">
                                Please read carefully before cancelling:
                            </p>

                            <ul className="text-sm text-gray-600 mb-4 list-disc pl-5 space-y-1">
                                <li>
                                    Cancel within <strong>1 hour</strong> → full refund
                                </li>
                                <li>After 1 hour → cancellation fee applies</li>
                                <li>This action cannot be undone</li>
                            </ul>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowCancelModal(false)}
                                    disabled={cancelling}
                                    className="flex-1 py-2 rounded-xl border hover:bg-gray-100"
                                >
                                    Keep Subscription
                                </button>

                                <button
                                    onClick={handleCancelSubscription}
                                    disabled={cancelling}
                                    className="flex-1 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                                >
                                    {cancelling ? "Cancelling..." : "Confirm Cancel"}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default ActiveSubscription;
