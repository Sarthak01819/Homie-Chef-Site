import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Loader from "../components/Loader";
import ErrorState from "../components/ErrorState";
import EmptyState from "../components/EmptyState";
import CustomizationModal from "../components/CustomizationModal";
import SubscriptionPage from "../components/SubscriptionPage";
import TrackerPage from "../components/TrackerPage";

const Tracker = () => {
    /* =========================
       STATE & REFS
    ========================= */
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [customizationOpen, setCustomizationOpen] = useState(false);
    const [selectedDay, setSelectedDay] = useState(1);

    const [deliveredMeals, setDeliveredMeals] = useState(() =>
        JSON.parse(localStorage.getItem("deliveredMeals") || "{}")
    );

    const [animated, setAnimated] = useState({
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0,
    });

    const [expandedMeals, setExpandedMeals] = useState({});

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
    const totalPlanDays = days.length;

    // Get meals for selected day
    const selectedDayIndex = Math.min(selectedDay - 1, days.length - 1);
    const selectedDayMeals = days[selectedDayIndex] || null;

    /* =========================
       FUNCTION TO GET MACROS FOR DELIVERED MEALS ONLY
    ========================= */
    const getDeliveredMacros = (day, dayNumber) => {
        let calories = 0, protein = 0, carbs = 0, fats = 0;

        // Only count lunch if delivered
        if (deliveredMeals[`${dayNumber}-lunch`] && day?.lunch?.meal?.macros) {
            calories += day.lunch.meal.macros.calories || 0;
            protein += day.lunch.meal.macros.protein || 0;
            carbs += day.lunch.meal.macros.carbs || 0;
            fats += day.lunch.meal.macros.fats || 0;
        }

        // Only count dinner if delivered
        if (deliveredMeals[`${dayNumber}-dinner`] && day?.dinner?.meal?.macros) {
            calories += day.dinner.meal.macros.calories || 0;
            protein += day.dinner.meal.macros.protein || 0;
            carbs += day.dinner.meal.macros.carbs || 0;
            fats += day.dinner.meal.macros.fats || 0;
        }

        return { calories, protein, carbs, fats };
    };

    const selectedDayMacros = selectedDayMeals ? getDeliveredMacros(selectedDayMeals, selectedDayMeals.day) : null;

    /* =========================
       ANIMATE MACROS (only for delivered meals)
    ========================= */
    useEffect(() => {
        if (!selectedDayMacros) {
            setAnimated({ calories: 0, protein: 0, carbs: 0, fats: 0 });
            return;
        }

        macrosTargetRef.current = selectedDayMacros;
        setAnimated({ calories: 0, protein: 0, carbs: 0, fats: 0 });

        const duration = 800;
        let start = null;

        const animate = (time) => {
            if (!start) start = time;
            const p = Math.min((time - start) / duration, 1);

            setAnimated({
                calories: Math.floor(p * selectedDayMacros.calories),
                protein: Math.floor(p * selectedDayMacros.protein),
                carbs: Math.floor(p * selectedDayMacros.carbs),
                fats: Math.floor(p * selectedDayMacros.fats),
            });

            if (p < 1) requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);
    }, [selectedDay, deliveredMeals]);

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
       WEEKLY PROGRESS - Only counts delivered meals
    ========================= */
    const calculateWeeklyTotals = () => {
        if (!days.length) return { calories: 0, protein: 0, carbs: 0, fats: 0 };

        let calories = 0, protein = 0, carbs = 0, fats = 0;
        const daysToCalculate = Math.min(days.length, 7);

        for (let i = 0; i < daysToCalculate; i++) {
            const dayNumber = days[i].day;
            const macros = getDeliveredMacros(days[i], dayNumber);
            calories += macros.calories;
            protein += macros.protein;
            carbs += macros.carbs;
            fats += macros.fats;
        }

        return { calories, protein, carbs, fats };
    };

    const weeklyTotals = calculateWeeklyTotals();

    /* =========================
       SMART REMINDER
    ========================= */
    const hour = today.getHours();
    const lunchDone =
        deliveredMeals[`${days[todayIndex]?.day}-lunch`];
    const dinnerDone =
        deliveredMeals[`${days[todayIndex]?.day}-dinner`];

    let reminder = null;
    if (selectedDay === todayIndex + 1) {
        if (hour >= 13 && !lunchDone)
            reminder = "⏰ Don't forget your lunch!";
        if (hour >= 20 && !dinnerDone)
            reminder = "🌙 Dinner is waiting for you!";
    }

    /* =========================
       DAY NAVIGATION
    ========================= */
    const handleDayChange = (direction) => {
        if (direction === 'next' && selectedDay < totalPlanDays) {
            setSelectedDay(selectedDay + 1);
        } else if (direction === 'prev' && selectedDay > 1) {
            setSelectedDay(selectedDay - 1);
        }
    };

    const handleDaySelect = (day) => {
        setSelectedDay(day);
    };

    /* =========================
       MEAL CARD TOGGLE
    ========================= */
    const toggleMealCard = (mealType) => {
        setExpandedMeals(prev => ({
            ...prev,
            [mealType]: !prev[mealType]
        }));
    };

    /* =========================
       CONFIRM DELIVERY HANDLERS
    ========================= */
    const openConfirmModal = (day, type) => {
        setConfirmModal({ open: true, day, type });
    };

    const confirmDelivery = async () => {
        const { day, type } = confirmModal;

        // 1️⃣ Optimistic UI - Mark meal as delivered
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

    /* =========================
       GET TOTAL MACROS FOR DAY (for display purposes)
    ========================= */
    const getTotalMacrosForDay = (day) => {
        if (!day) return { calories: 0, protein: 0, carbs: 0, fats: 0 };

        const l = day?.lunch?.meal?.macros || {};
        const d = day?.dinner?.meal?.macros || {};
        return {
            calories: (l.calories || 0) + (d.calories || 0),
            protein: (l.protein || 0) + (d.protein || 0),
            carbs: (l.carbs || 0) + (d.carbs || 0),
            fats: (l.fats || 0) + (d.fats || 0),
        };
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
            <div className="min-h-screen w-full px-4 pb-14 pt-28 bg-linear-to-br from-[#0F1C2E] via-[#162A44] to-[#1F3A5F]">
                <div className="max-w-7xl mx-auto text-white">
                    {/* Weekly Progress Banner - Only shows delivered meals */}
                    <div className="bg-linear-to-r py-8 from-[#667eea] to-[#764ba2] rounded-2xl p-6 mb-8 shadow-2xl">
                        <h3 className="text-white text-4xl font-bold mb-6 text-center">
                            Weekly Progress
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-yellow-300 mb-2">
                                    {Math.round(weeklyTotals.calories / 100) * 100} kcal
                                </div>
                                <div className="text-gray-200 font-semibold">Total Calories</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-yellow-300 mb-2">
                                    {Math.round(weeklyTotals.protein)}g
                                </div>
                                <div className="text-gray-200 font-semibold">Total Protein</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-yellow-300 mb-2">
                                    {Math.round(weeklyTotals.carbs)}g
                                </div>
                                <div className="text-gray-200 font-semibold">Total Carbs</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-yellow-300 mb-2">
                                    {Math.round(weeklyTotals.fats)}g
                                </div>
                                <div className="text-gray-200 font-semibold">Total Fats</div>
                            </div>
                        </div>
                    </div>

                    {reminder && (
                        <div className="mb-6 p-4 bg-linear-to-r from-yellow-500/20 to-orange-500/20 rounded-xl text-center text-yellow-300 font-medium border border-yellow-500/30">
                            {reminder}
                        </div>
                    )}

                    {/* Day Selection */}
                    <div className="mb-8">
                        <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
                            <label className="text-white font-semibold text-lg">Select Day:</label>
                            <div className="relative flex-1 min-w-50">
                                <select
                                    value={selectedDay}
                                    onChange={(e) => handleDaySelect(parseInt(e.target.value))}
                                    className="w-full px-5 py-3 rounded-xl bg-white/10 border-2 border-white/20 text-white font-semibold cursor-pointer appearance-none focus:outline-none focus:border-yellow-500"
                                >
                                    {Array.from({ length: totalPlanDays }, (_, i) => i + 1).map(day => {
                                        const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
                                        const dayName = dayNames[(day - 1) % 7];
                                        return (
                                            <option key={day} value={day} className="bg-[#1E293B] text-white">
                                                Day {day} - {dayName}
                                            </option>
                                        );
                                    })}
                                </select>
                                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Day Summary - Only shows delivered meals */}
                    <div className="bg-linear-to-r from-[#1E293B]/80 to-[#0F172A]/90 rounded-2xl p-6 mb-8 border-l-4 border-yellow-500 shadow-xl">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                            <div>
                                <h3 className="text-white text-2xl font-bold mb-4">
                                    Day {selectedDay} - {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][(selectedDay - 1) % 7]}
                                </h3>
                            </div>
                            {milestone && (
                                <span className="px-4 py-2 rounded-full bg-linear-to-r from-yellow-500/20 to-orange-500/20 text-yellow-300 font-semibold text-sm">
                                    {milestone}
                                </span>
                            )}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-4">
                            <div className="text-center mb-4">
                                <div className="text-gray-300 text-lg font-bold mb-1">Total Calories</div>
                                <div className="text-white text-2xl font-bold">{animated.calories} kcal</div>
                                {/* <div className="text-gray-400 text-xs">
                                    of {getTotalMacrosForDay(selectedDayMeals).calories} kcal
                                </div> */}
                            </div>
                            <div className="text-center mb-4">
                                <div className="text-gray-300 text-lg font-bold mb-1">Protein</div>
                                <div className="text-[#6EC1E4] text-2xl font-bold">{animated.protein}g</div>
                                {/* <div className="text-gray-400 text-xs">
                                    of {getTotalMacrosForDay(selectedDayMeals).protein}g
                                </div> */}
                            </div>
                            <div className="text-center mb-4">
                                <div className="text-gray-300 text-lg font-bold mb-1">Carbs</div>
                                <div className="text-[#10B981] text-2xl font-bold">{animated.carbs}g</div>
                                {/* <div className="text-gray-400 text-xs">
                                    of {getTotalMacrosForDay(selectedDayMeals).carbs}g
                                </div> */}
                            </div>
                            <div className="text-center mb-4">
                                <div className="text-gray-300 text-lg font-bold mb-1">Fats</div>
                                <div className="text-[#F59E0B] text-2xl font-bold">{animated.fats}g</div>
                                {/* <div className="text-gray-400 text-xs">
                                    of {getTotalMacrosForDay(selectedDayMeals).fats}g
                                </div> */}
                            </div>
                        </div>

                        {/* Progress indicator for delivered meals */}
                        <div className="mb-4">
                            <div className="flex justify-between text-gray-300 text-sm mb-1">
                                <span>Meals Delivered:</span>
                                <span>
                                    {(deliveredMeals[`${selectedDayMeals?.day}-lunch`] ? 1 : 0) +
                                        (deliveredMeals[`${selectedDayMeals?.day}-dinner`] ? 1 : 0)} of 2
                                </span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                                <div
                                    className="bg-linear-to-r from-emerald-500 to-green-500 h-2 rounded-full transition-all duration-300"
                                    style={{
                                        width: `${((deliveredMeals[`${selectedDayMeals?.day}-lunch`] ? 1 : 0) +
                                            (deliveredMeals[`${selectedDayMeals?.day}-dinner`] ? 1 : 0)) / 2 * 100}%`
                                    }}
                                ></div>
                            </div>
                        </div>

                        {/* <div className="text-gray-300 text-sm">
                            {selectedDay === todayIndex + 1
                                ? "Today's progress updates as you mark meals as delivered."
                                : "Mark meals as delivered to track your daily progress."}
                        </div> */}
                    </div>

                    {/* Meals Container */}
                    <div className="space-y-6">
                        {/* Breakfast Card */}
                        <div className="bg-linear-to-r bg-[#0F172A]/90 rounded-2xl overflow-hidden border-white/10 shadow-2xl hover:border-amber-300 border-2 transition-all">
                            <div
                                className="cursor-pointer p-6 flex justify-between items-center hover:bg-white/5 transition-all"
                                onClick={() => toggleMealCard('breakfast')}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">⏳</span>
                                    <div>
                                        <h3 className="text-white text-xl font-bold">
                                            Breakfast: Coming Soon
                                        </h3>
                                        <div className="text-gray-400 text-sm">
                                            We're working on adding breakfast options to our meal plans
                                        </div>
                                    </div>
                                </div>
                                <span className="text-yellow-500 text-2xl transition-transform duration-300">
                                    {expandedMeals.breakfast ? '▲' : '▼'}
                                </span>
                            </div>

                            <AnimatePresence>
                                {expandedMeals.breakfast && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-6 pb-6 pt-2 border-t border-white/10">
                                            <div className="flex flex-col md:flex-row gap-6">
                                                <div className="flex-1">
                                                    <div className="mb-4">
                                                        <div className="text-gray-400 text-sm mb-2">Information</div>
                                                        <div className="text-white text-lg font-semibold">Breakfast is coming soon!</div>
                                                    </div>
                                                    <p className="text-gray-300">
                                                        We're currently developing a variety of nutritious breakfast options to complement your meal plan. 
                                                        Stay tuned for delicious morning meals that will help you start your day right!
                                                    </p>
                                                </div>
                                                <div className="shrink-0">
                                                    <div className="w-40 h-32 rounded-xl bg-linear-to-br from-gray-700 to-gray-900 flex items-center justify-center text-gray-400 font-semibold">
                                                        ⏳ Coming Soon
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-6 pt-4 border-t border-white/10">
                                                <div className="flex gap-3">
                                                    <button
                                                        onClick={() => {/* Notification signup functionality */ }}
                                                        className="flex-1 py-3 rounded-2xl bg-linear-to-r from-gray-600 to-gray-700 text-white font-semibold hover:opacity-90 transition-all"
                                                    >
                                                        🔔 Notify Me
                                                    </button>
                                                    <button
                                                        disabled={true}
                                                        className="flex-1 py-3 rounded-2xl bg-linear-to-r from-gray-700 to-gray-800 text-gray-400 font-semibold cursor-not-allowed transition-all"
                                                    >
                                                        ⏳ Coming Soon
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Lunch Card */}
                        {selectedDayMeals?.lunch && (
                            <div className="bg-linear-to-r bg-[#0F172A]/90 rounded-2xl overflow-hidden border-white/10 shadow-2xl hover:border-amber-300 border-2 transition-all">
                                <div
                                    className="cursor-pointer p-6 flex justify-between items-center hover:bg-white/5 transition-all"
                                    onClick={() => toggleMealCard('lunch')}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">🍽️</span>
                                        <div>
                                            <h3 className="text-white text-xl font-bold">
                                                Lunch: {selectedDayMeals.lunch.meal.name}
                                            </h3>
                                            <div className="text-gray-400 text-sm">
                                                {deliveredMeals[`${selectedDayMeals.day}-lunch`]
                                                    ? "✓ Delivered - Counted in progress"
                                                    : "Not delivered yet - Not counted in progress"}
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-yellow-500 text-2xl transition-transform duration-300">
                                        {expandedMeals.lunch ? '▲' : '▼'}
                                    </span>
                                </div>

                                <AnimatePresence>
                                    {expandedMeals.lunch && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-6 pb-6 pt-2 border-t border-white/10">
                                                <div className="flex flex-col md:flex-row gap-6">
                                                    <div className="flex-1">
                                                        <div className="mb-4">
                                                            <div className="text-gray-400 text-sm mb-2">Nutrition Facts</div>
                                                            <div className="text-white text-lg font-semibold">{selectedDayMeals.lunch.meal.name}</div>
                                                        </div>
                                                        <ul className="space-y-2">
                                                            <li className="flex justify-between items-center py-2 border-b border-amber-300/70">
                                                                <span className="text-[#6EC1E4] font-semibold">Calories</span>
                                                                <span className="text-white font-bold">{selectedDayMeals.lunch.meal.macros?.calories || 0} kcal</span>
                                                            </li>
                                                            <li className="flex justify-between items-center py-2 border-b border-amber-300/70">
                                                                <span className="text-[#6EC1E4] font-semibold">Protein</span>
                                                                <span className="text-white font-bold">{selectedDayMeals.lunch.meal.macros?.protein || 0}g</span>
                                                            </li>
                                                            <li className="flex justify-between items-center py-2 border-b border-amber-300/70">
                                                                <span className="text-[#6EC1E4] font-semibold">Carbs</span>
                                                                <span className="text-white font-bold">{selectedDayMeals.lunch.meal.macros?.carbs || 0}g</span>
                                                            </li>
                                                            <li className="flex justify-between items-center py-2">
                                                                <span className="text-[#6EC1E4] font-semibold">Fat</span>
                                                                <span className="text-white font-bold">{selectedDayMeals.lunch.meal.macros?.fats || 0}g</span>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                    <div className="shrink-0">
                                                        <div className="w-40 h-32 rounded-xl bg-linear-to-br from-gray-700 to-gray-900 flex items-center justify-center text-gray-400 font-semibold">
                                                            Meal Image
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mt-6 pt-4 border-t border-white/10">
                                                    <div className="flex gap-3">
                                                        <button
                                                            onClick={() => {/* Rating functionality */ }}
                                                            className="flex-1 py-3 rounded-2xl bg-linear-to-r from-[#6B7280] to-[#4B5563] text-white font-semibold hover:opacity-90 transition-all hover:shadow-lg shadow-gray-500/50 cursor-pointer hover:scale-105 transform"
                                                        >
                                                            ⭐ Rate Meal
                                                        </button>
                                                        <button
                                                            disabled={deliveredMeals[`${selectedDayMeals.day}-lunch`]}
                                                            onClick={() => openConfirmModal(selectedDayMeals.day, 'lunch')}
                                                            className={`flex-1 py-3 rounded-2xl font-semibold transition-all hover:shadow-lg ${deliveredMeals[`${selectedDayMeals.day}-lunch`]
                                                                    ? 'bg-linear-to-r bg-emerald-500 text-white cursor-not-allowed shadow-emerald-500/50'
                                                                    : 'bg-linear-to-r bg-emerald-500 text-white hover:opacity-90 cursor-pointer shadow-emerald-500/50'
                                                                }`}
                                                        >
                                                            {deliveredMeals[`${selectedDayMeals.day}-lunch`] ? 'Delivered ✓' : '✔ Mark as Done'}
                                                        </button>
                                                    </div>
                                                    {!deliveredMeals[`${selectedDayMeals.day}-lunch`] && (
                                                        <div className="text-center mt-3 text-gray-400 text-sm">
                                                            Mark as delivered to count in your progress
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}

                        {/* Dinner Card */}
                        {selectedDayMeals?.dinner && (
                            <div className="bg-linear-to-r bg-[#0F172A]/90 rounded-2xl overflow-hidden border-white/10 shadow-2xl hover:border-amber-300 border-2 transition-all">
                                <div
                                    className="cursor-pointer p-6 flex justify-between items-center hover:bg-white/5 transition-all"
                                    onClick={() => toggleMealCard('dinner')}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">🌙</span>
                                        <div>
                                            <h3 className="text-white text-xl font-bold">
                                                Dinner: {selectedDayMeals.dinner.meal.name}
                                            </h3>
                                            <div className="text-gray-400 text-sm">
                                                {deliveredMeals[`${selectedDayMeals.day}-dinner`]
                                                    ? "✓ Delivered - Counted in progress"
                                                    : "Not delivered yet - Not counted in progress"}
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-yellow-500 text-2xl transition-transform duration-300">
                                        {expandedMeals.dinner ? '▲' : '▼'}
                                    </span>
                                </div>

                                <AnimatePresence>
                                    {expandedMeals.dinner && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-6 pb-6 pt-2 border-t border-white/10">
                                                <div className="flex flex-col md:flex-row gap-6">
                                                    <div className="flex-1">
                                                        <div className="mb-4">
                                                            <div className="text-gray-400 text-sm mb-2">Nutrition Facts</div>
                                                            <div className="text-white text-lg font-semibold">{selectedDayMeals.dinner.meal.name}</div>
                                                        </div>
                                                        <ul className="space-y-2">
                                                            <li className="flex justify-between items-center py-2 border-b border-amber-300/70">
                                                                <span className="text-[#6EC1E4] font-semibold">Calories</span>
                                                                <span className="text-white font-bold">{selectedDayMeals.dinner.meal.macros?.calories || 0} kcal</span>
                                                            </li>
                                                            <li className="flex justify-between items-center py-2 border-b border-amber-300/70">
                                                                <span className="text-[#6EC1E4] font-semibold">Protein</span>
                                                                <span className="text-white font-bold">{selectedDayMeals.dinner.meal.macros?.protein || 0}g</span>
                                                            </li>
                                                            <li className="flex justify-between items-center py-2 border-b border-amber-300/70">
                                                                <span className="text-[#6EC1E4] font-semibold">Carbs</span>
                                                                <span className="text-white font-bold">{selectedDayMeals.dinner.meal.macros?.carbs || 0}g</span>
                                                            </li>
                                                            <li className="flex justify-between items-center py-2">
                                                                <span className="text-[#6EC1E4] font-semibold">Fat</span>
                                                                <span className="text-white font-bold">{selectedDayMeals.dinner.meal.macros?.fats || 0}g</span>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                    <div className="shrink-0">
                                                        <div className="w-40 h-32 rounded-xl bg-linear-to-br from-gray-700 to-gray-900 flex items-center justify-center text-gray-400 font-semibold">
                                                            Meal Image
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mt-6 pt-4 border-t border-white/10">
                                                    <div className="flex gap-3">
                                                        <button
                                                            onClick={() => {/* Rating functionality */ }}
                                                            className="flex-1 py-3 rounded-2xl bg-linear-to-r from-[#6B7280] to-[#4B5563] text-white font-semibold hover:opacity-90 transition-all hover:shadow-lg shadow-gray-500/50 cursor-pointer"
                                                        >
                                                            ⭐ Rate Meal
                                                        </button>
                                                        <button
                                                            disabled={deliveredMeals[`${selectedDayMeals.day}-dinner`]}
                                                            onClick={() => openConfirmModal(selectedDayMeals.day, 'dinner')}
                                                            className={`flex-1 py-3 rounded-2xl font-semibold transition-all hover:shadow-lg ${deliveredMeals[`${selectedDayMeals.day}-dinner`]
                                                                    ? 'bg-linear-to-r bg-emerald-500 text-white cursor-not-allowed shadow-emerald-500/50'
                                                                    : 'bg-linear-to-r bg-emerald-500 text-white hover:opacity-90 cursor-pointer shadow-emerald-500/50'
                                                                }`}
                                                        >
                                                            {deliveredMeals[`${selectedDayMeals.day}-dinner`] ? 'Delivered ✓' : '✔ Mark as Done'}
                                                        </button>
                                                    </div>
                                                    {!deliveredMeals[`${selectedDayMeals.day}-dinner`] && (
                                                        <div className="text-center mt-3 text-gray-400 text-sm">
                                                            Mark as delivered to count in your progress
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}

                        {/* Customization Button */}
                        <div className="text-center mt-8">
                            <button
                                onClick={() => setCustomizationOpen(true)}
                                className="px-8 py-3 rounded-xl bg-linear-to-r from-yellow-500 to-orange-500 text-white font-bold text-lg shadow-xl hover:scale-105 active:scale-95 transition-all"
                            >
                                Need a customization?
                            </button>
                        </div>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex justify-between mt-8">
                        <button
                            onClick={() => handleDayChange('prev')}
                            disabled={selectedDay <= 1}
                            className={`px-6 py-3 rounded-xl font-semibold transition-all ${selectedDay <= 1
                                    ? 'bg-white/10 text-gray-400 cursor-not-allowed'
                                    : 'bg-white/20 text-white hover:bg-white/30 cursor-pointer'
                                }`}
                        >
                            ← Previous Day
                        </button>
                        <button
                            onClick={() => handleDayChange('next')}
                            disabled={selectedDay >= totalPlanDays}
                            className={`px-6 py-3 rounded-xl font-semibold transition-all ${selectedDay >= totalPlanDays
                                    ? 'bg-white/10 text-gray-400 cursor-not-allowed'
                                    : 'bg-linear-to-r from-emerald-600 to-blue-600 text-white hover:opacity-90 cursor-pointer'
                                }`}
                        >
                            {selectedDay >= totalPlanDays ? 'Plan Complete!' : 'Next Day →'}
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
                        className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="bg-linear-to-br from-[#1E293B] to-[#0F172A] rounded-3xl p-8 max-w-md w-full mx-4 border-2 border-yellow-500 shadow-2xl"
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                        >
                            <h3 className="text-2xl font-bold text-white mb-4 text-center">
                                Confirm Delivery
                            </h3>
                            <p className="text-gray-300 mb-4 text-center">
                                Have you received your{" "}
                                <span className="text-yellow-300 font-bold">
                                    {confirmModal.type === "lunch" ? "Lunch" : "Dinner"}
                                </span>{" "}
                                meal?
                            </p>
                            <p className="text-gray-400 text-sm mb-6 text-center">
                                ✓ This meal will be counted in your daily and weekly progress
                            </p>

                            <div className="flex gap-4">
                                <button
                                    onClick={() =>
                                        setConfirmModal({
                                            open: false,
                                            day: null,
                                            type: null,
                                        })
                                    }
                                    className="flex-1 py-3 rounded-xl bg-white/10 text-white font-semibold hover:bg-white/20 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelivery}
                                    className="flex-1 py-3 rounded-xl bg-linear-to-r from-emerald-600 to-green-600 text-white font-semibold hover:opacity-90 transition-all"
                                >
                                    Yes, Delivered
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* Customization Modal */}
                <CustomizationModal
                    open={customizationOpen}
                    onClose={() => setCustomizationOpen(false)}
                    subscriptionId={subscription?._id}
                />

            </AnimatePresence>

        </>
    );
};

export default Tracker;