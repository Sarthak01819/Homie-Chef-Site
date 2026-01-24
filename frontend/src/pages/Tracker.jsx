import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Loader from "../components/Loader";
import ErrorState from "../components/ErrorState";
import EmptyState from "../components/EmptyState";
import CustomizationModal from "../components/CustomizationModal";

const Tracker = () => {
    /* =========================
       STATE & REFS
    ========================= */
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [customizationOpen, setCustomizationOpen] = useState(false);

    const [deliveredMeals, setDeliveredMeals] = useState(() =>
        JSON.parse(localStorage.getItem("deliveredMeals") || "{}")
    );

    const [animated, setAnimated] = useState({
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0,
    });

    const macrosTargetRef = useRef({
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0,
    });

    // 🔔 Confirmation modal state
    const [confirmModal, setConfirmModal] = useState({
        open: false,
        day: null,
        type: null,
    });

    /* =========================
       FETCH SUBSCRIPTION
    ========================= */
    useEffect(() => {
        const fetchSubscription = async () => {
            try {
                const res = await fetch(
                    `${import.meta.env.VITE_API_URL}/subscriptions/my`,
                    { credentials: "include" }
                );

                if (!res.ok) {
                    setSubscription(null);
                    return;
                }

                const data = await res.json();
                setSubscription(data || null);
            } catch {
                setError("Failed to load tracker");
            } finally {
                setLoading(false);
            }
        };

        fetchSubscription();
    }, []);

    /* =========================
       PERSIST DELIVERY STATE
    ========================= */
    useEffect(() => {
        localStorage.setItem(
            "deliveredMeals",
            JSON.stringify(deliveredMeals)
        );
    }, [deliveredMeals]);

    /* =========================
       DERIVED DATA
    ========================= */
    const startDate = subscription?.startDate
        ? new Date(subscription.startDate)
        : null;

    const today = new Date();

    const todayIndex =
        startDate !== null
            ? Math.floor(
                (today - startDate) / (1000 * 60 * 60 * 24)
            )
            : -1;

    const days = subscription?.plan?.mealsByDay || [];
    const todayMeals =
        todayIndex >= 0 ? days[todayIndex] : null;

    const getMacros = (day) => {
        const l = day?.lunch?.meal?.macros || {};
        const d = day?.dinner?.meal?.macros || {};
        return {
            calories: (l.calories || 0) + (d.calories || 0),
            protein: (l.protein || 0) + (d.protein || 0),
            carbs: (l.carbs || 0) + (d.carbs || 0),
            fats: (l.fats || 0) + (d.fats || 0),
        };
    };

    const todayMacros = todayMeals ? getMacros(todayMeals) : null;

    /* =========================
       ANIMATE MACROS
    ========================= */
    useEffect(() => {
        if (!todayMacros) {
            setAnimated({ calories: 0, protein: 0, carbs: 0, fats: 0 });
            return;
        }

        macrosTargetRef.current = todayMacros;
        setAnimated({ calories: 0, protein: 0, carbs: 0, fats: 0 });

        const duration = 800;
        let start = null;

        const animate = (time) => {
            if (!start) start = time;
            const p = Math.min((time - start) / duration, 1);

            setAnimated({
                calories: Math.floor(p * todayMacros.calories),
                protein: Math.floor(p * todayMacros.protein),
                carbs: Math.floor(p * todayMacros.carbs),
                fats: Math.floor(p * todayMacros.fats),
            });

            if (p < 1) requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);
    }, [todayIndex]);

    /* =========================
       STREAK & MILESTONE
    ========================= */
    const calculateStreak = () => {
        if (!days.length || todayIndex < 0) return 0;

        let streak = 0;
        for (let i = todayIndex; i >= 0; i--) {
            if (
                deliveredMeals[`${days[i].day}-lunch`] &&
                deliveredMeals[`${days[i].day}-dinner`]
            ) {
                streak++;
            } else break;
        }
        return streak;
    };

    const streak = calculateStreak();

    const milestone =
        streak >= 30
            ? "🥇 30-Day Champion"
            : streak >= 15
                ? "🥈 15-Day Warrior"
                : streak >= 7
                    ? "🥉 7-Day Starter"
                    : null;

    /* =========================
       SMART REMINDER
    ========================= */
    const hour = today.getHours();
    const lunchDone =
        deliveredMeals[`${todayMeals?.day}-lunch`];
    const dinnerDone =
        deliveredMeals[`${todayMeals?.day}-dinner`];

    let reminder = null;
    if (hour >= 13 && !lunchDone)
        reminder = "⏰ Don’t forget your lunch!";
    if (hour >= 20 && !dinnerDone)
        reminder = "🌙 Dinner is waiting for you!";

    /* =========================
       CONFIRM DELIVERY HANDLERS
    ========================= */
    const openConfirmModal = (day, type) => {
        setConfirmModal({ open: true, day, type });
    };

    const confirmDelivery = async () => {
        const { day, type } = confirmModal;

        // 1️⃣ Optimistic UI
        setDeliveredMeals((prev) => ({
            ...prev,
            [`${day}-${type}`]: true,
        }));

        setConfirmModal({ open: false, day: null, type: null });

        // 2️⃣ Admin sync (best effort)
        try {
            await fetch(
                `${import.meta.env.VITE_API_URL}/admin/deliveries`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({
                        subscriptionId: subscription._id,
                        day,
                        mealType: type,
                        deliveredAt: new Date().toISOString(),
                    }),
                }
            );
        } catch {
            // silent fail (UX first)
            console.warn("Admin delivery sync failed");
        }
    };

    const submitCustomizationRequest = async ({
        subscriptionId,
        type,
        message,
        preferredDate,
        onSuccess,
    }) => {
        try {
            await fetch(
                `${import.meta.env.VITE_API_URL}/admin/customization-requests`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({
                        subscriptionId,
                        type,
                        message,
                        preferredDate,
                    }),
                }
            );

            onSuccess?.();
        } catch (err) {
            alert("Failed to send request. Please try again.");
        }
    };


    const syncDeliveryToAdmin = async ({ day, type }) => {
        try {
            await fetch(
                `${import.meta.env.VITE_API_URL}/admin/deliveries`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({
                        subscriptionId: subscription._id,
                        day,
                        mealType: type,
                        deliveredAt: new Date().toISOString(),
                    }),
                }
            );
        } catch (err) {
            console.warn("Admin delivery sync failed");
        }
    };


    /* =========================
       RENDER STATES
    ========================= */
    if (loading) return <Loader />;

    if (error)
        return (
            <ErrorState
                message={error}
                onRetry={() => window.location.reload()}
            />
        );

    if (!subscription)
        return (
            <EmptyState
                icon="📅"
                title="No active subscription"
                description="Subscribe to start tracking meals."
                actionLabel="Browse Plans"
                actionTo="/subscription"
            />
        );

    /* =========================
       UI
    ========================= */
    return (
        <>
            <div className="min-h-screen px-4 pb-14 pt-28 bg-linear-to-br from-[#0F2027] via-[#203A43] to-[#2C5364]">
                <div className="max-w-5xl mx-auto text-white">
                    <h1 className="text-4xl font-bold text-center mb-8">
                        Meal Tracker
                    </h1>

                    {reminder && (
                        <div className="mb-4 text-center text-yellow-300 font-medium">
                            {reminder}
                        </div>
                    )}

                    <div className="rounded-3xl p-6 bg-linear-to-r from-[#119DA4]/90 to-[#FDE789]/90 text-black mb-10">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">
                                Today • Day {todayMeals.day}
                            </h2>
                            {milestone && (
                                <span className="px-3 py-1 rounded-full bg-black/20 text-sm font-semibold">
                                    {milestone}
                                </span>
                            )}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-6">
                            {Object.entries(animated).map(([k, v]) => (
                                <div key={k}>
                                    <p className="text-sm capitalize">{k}</p>
                                    <p className="text-3xl font-bold">{v}</p>
                                </div>
                            ))}
                        </div>

                        {["lunch", "dinner"].map((type) => {
                            const delivered =
                                deliveredMeals[`${todayMeals.day}-${type}`];

                            return (
                                <div
                                    key={type}
                                    className="flex justify-between bg-white/70 rounded-xl px-4 py-3 mb-3 items-center"
                                >
                                    <span>
                                        {type === "lunch" ? "🍽 Lunch" : "🌙 Dinner"} —{" "}
                                        <b>{todayMeals[type].meal.name}</b>
                                    </span>
                                    <button
                                        disabled={delivered}
                                        onClick={() =>
                                            openConfirmModal(todayMeals.day, type)
                                        }
                                        className={
                                            delivered
                                                ? "text-green-700 font-semibold cursor-not-allowed py-2 px-4 shadow-lg"
                                                : "text-black font-semibold cursor-pointer hover:bg-gray-200/70 py-2 px-4 rounded-lg shadow-md transition-all"
                                        }
                                    >
                                        {delivered ? "Delivered ✓" : "Mark Delivered"}
                                    </button>
                                </div>
                            );
                        })}
                        <button
                            onClick={() => setCustomizationOpen(true)}
                            className="mt-4 text-green-700 font-semibold py-2 px-4 shadow-xl cursor-pointer hover:scale-105 active:scale-95 bg-white/70 rounded-xl transition-all"
                        >
                            Need a customization?
                        </button>
                    </div>
                </div>
            </div>

            {/* =========================
         CONFIRM MODAL
      ========================= */}
            <AnimatePresence>
                {confirmModal.open && (
                    <motion.div
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="bg-white rounded-2xl p-6 max-w-sm w-full text-center"
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                        >
                            <h3 className="text-xl font-semibold mb-2">
                                Confirm Delivery
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Have you received your{" "}
                                <b>
                                    {confirmModal.type === "lunch"
                                        ? "Lunch"
                                        : "Dinner"}
                                </b>{" "}
                                meal?
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={() =>
                                        setConfirmModal({
                                            open: false,
                                            day: null,
                                            type: null,
                                        })
                                    }
                                    className="flex-1 py-2 rounded-xl border"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelivery}
                                    className="flex-1 py-2 rounded-xl bg-green-700 text-white"
                                >
                                    Yes, Delivered
                                </button>

                            </div>
                        </motion.div>
                    </motion.div>
                )}
                <CustomizationModal
                    open={customizationOpen}
                    onClose={() => setCustomizationOpen(false)}
                    subscriptionId={subscription._id}
                />

            </AnimatePresence>
        </>
    );
};

export default Tracker;
