import { useEffect, useState } from "react";
import Loader from "../components/Loader";
import toast from "react-hot-toast";
import { ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import CustomizationModal from "../components/CustomizationModal";

const ActiveSubscription = () => {
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(null);

    const [showCancelModal, setShowCancelModal] = useState(false);
    const [selectedSub, setSelectedSub] = useState(null);
    const [cancelling, setCancelling] = useState(false);
    const [error, setError] = useState(null);
    const [customizationOpen, setCustomizationOpen] = useState(false);

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
                setError({
                    message: "Failed to load subscriptions",
                });
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
            <div className="max-w-5xl mx-auto px-4 py-8 mt-20">
                <Loader />
            </div>
        );
    }

    if (error) {
        return (
            <ErrorState
                message={error.message}
                onRetry={() => window.location.reload()}
            />
        );
    }

    const now = Date.now();

    return (
        <motion.div className="min-h-screen bg-linear-to-br from-[#0F2027] via-[#203A43] to-[#2C5364] pt-20 pb-10">
            <motion.div
                className="max-w-5xl mx-auto px-4 py-8 min-h-[80vh] bg-linear-to-r from-[#119DA4]/90 to-[#FDE789]/90 backdrop-blur-2xl rounded-2xl shadow-2xl "
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

                {subscriptions.length === 0 ? (
                    <EmptyState
                        icon="🥗"
                        title="No active subscription"
                        description="Subscribe to a vegetarian meal plan and enjoy healthy, home-style food every day."
                        actionLabel="Browse Plans"
                        actionTo="/subscription"
                    />
                ) : (
                    <div className="space-y-6">
                        {subscriptions.map((sub) => {
                            const isActive = new Date(sub.endDate).getTime() > now;

                            return (
                                <motion.div
                                    key={sub._id}
                                    className="bg-white rounded-2xl shadow-md p-6"
                                    whileHover={{ y: -3 }}
                                >
                                    {/* HEADER */}
                                    <div className="flex justify-between items-center mb-2">
                                        <h2 className="text-xl font-semibold">
                                            {sub.plan?.name}
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

                                    <p className="text-sm font-medium mb-3">
                                        Price: ₹{sub.plan?.basePrice}
                                    </p>

                                    {/* CUSTOMIZATION INFO */}
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

                                    {/* VIEW PLAN */}
                                    <button
                                        onClick={() =>
                                            setExpanded(expanded === sub._id ? null : sub._id)
                                        }
                                        className="flex items-center gap-2 text-sm text-green-700 font-medium"
                                    >
                                        {expanded === sub._id ? (
                                            <>
                                                Hide Meals <ChevronUp size={16} />
                                            </>
                                        ) : (
                                            <>
                                                View Meals <ChevronDown size={16} />
                                            </>
                                        )}
                                    </button>

                                    {/* MEALS */}
                                    <AnimatePresence>
                                        {expanded === sub._id && (
                                            <motion.div
                                                className="mt-4 space-y-3 text-sm"
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                            >
                                                {sub.plan?.mealsByDay?.map((dayObj) => {
                                                    const lunch = dayObj.lunch?.meal;
                                                    const dinner = dayObj.dinner?.meal;

                                                    return (
                                                        <div
                                                            key={dayObj.day}
                                                            className="border rounded-xl p-3"
                                                        >
                                                            <p className="font-medium mb-1">
                                                                Day {dayObj.day}
                                                            </p>

                                                            {lunch && (
                                                                <p className="text-gray-700">
                                                                    🍽 Lunch — <b>{lunch.name}</b>
                                                                    <br />
                                                                    Calories: {lunch.macros?.calories} • Protein:{" "}
                                                                    {lunch.macros?.protein}g • Carbs:{" "}
                                                                    {lunch.macros?.carbs}g • Fats:{" "}
                                                                    {lunch.macros?.fats}g
                                                                </p>
                                                            )}

                                                            {dinner && (
                                                                <p className="text-gray-700 mt-2">
                                                                    🌙 Dinner — <b>{dinner.name}</b>
                                                                    <br />
                                                                    Calories: {dinner.macros?.calories} • Protein:{" "}
                                                                    {dinner.macros?.protein}g • Carbs:{" "}
                                                                    {dinner.macros?.carbs}g • Fats:{" "}
                                                                    {dinner.macros?.fats}g
                                                                </p>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* CANCEL */}
                                    {isActive && (
                                        <button
                                            onClick={() => {
                                                setSelectedSub(sub);
                                                setShowCancelModal(true);
                                            }}
                                            className="mt-4 px-5 py-2 rounded-xl border border-red-500 text-red-600 hover:bg-red-50 transition"
                                        >
                                            Cancel Subscription
                                        </button>
                                    )}
                                </motion.div>
                            );
                        })}
                        <button
                            onClick={() => setCustomizationOpen(true)}
                            className="mt-4 text-green-700 font-semibold py-2 px-4 shadow-lg cursor-pointer hover:scale-105 active:scale-95 bg-white/70 rounded-xl transition-all"
                        >
                            Need a customization?
                        </button>
                        <CustomizationModal
                            open={customizationOpen}
                            onClose={() => setCustomizationOpen(false)}
                            subscriptionId={subscriptions[0]?._id}
                        />

                    </div>
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

                                <ul className="text-sm text-gray-600 mb-4 list-disc pl-5 space-y-1">
                                    <li>Cancel within 1 hour → full refund</li>
                                    <li>After 1 hour → cancellation fee applies</li>
                                    <li>This action cannot be undone</li>
                                </ul>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowCancelModal(false)}
                                        disabled={cancelling}
                                        className="flex-1 py-2 rounded-xl border"
                                    >
                                        Keep Subscription
                                    </button>

                                    <button
                                        onClick={handleCancelSubscription}
                                        disabled={cancelling}
                                        className="flex-1 py-2 rounded-xl bg-red-600 text-white disabled:opacity-60"
                                    >
                                        {cancelling ? "Cancelling..." : "Confirm Cancel"}
                                    </button>
                                </div>

                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </motion.div>
    );
};

export default ActiveSubscription;
