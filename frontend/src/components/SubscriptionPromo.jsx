import { useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { CheckCircle, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const DAILY_MEAL_PRICE = 180; // per meal
const MEALS_PER_DAY = 2;

const SubscriptionPromo = () => {
    const navigate = useNavigate();
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const sectionRef = useRef(null);

    const { scrollY } = useScroll();
    const headingY = useTransform(scrollY, [0, 1000], [0, -50]);
    const highlightsY = useTransform(scrollY, [0, 1000], [0, 30]);
    const plansY = useTransform(scrollY, [0, 1000], [0, 20]);
    const buttonY = useTransform(scrollY, [0, 1000], [0, -30]);

    /* =========================
       FETCH PLANS FROM BACKEND
    ========================= */
    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const res = await fetch(
                    `${import.meta.env.VITE_API_URL}/subscriptions`
                );
                const data = await res.json();
                setPlans(Array.isArray(data) ? data : []);
            } catch {
                setPlans([]);
            } finally {
                setLoading(false);
            }
        };

        fetchPlans();
    }, []);

    const dailyCost = DAILY_MEAL_PRICE * MEALS_PER_DAY;

    return (
        <motion.section
            ref={sectionRef}
            className="
        relative my-24 mx-4
        rounded-3xl overflow-hidden
        bg-gradient-to-r from-[#119DA4]/90 to-[#FDE789]/90
        backdrop-blur-2xl shadow-2xl
      "
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
        >
            <div className="relative max-w-6xl mx-auto px-8 py-16 text-center">
                {/* Heading */}
                <motion.div style={{ y: headingY }}>
                    <h2 className="text-4xl md:text-5xl font-extrabold text-black mb-3">
                        Smarter Than Daily Ordering
                    </h2>

                    <p className="text-xl font-semibold text-black/80 mb-10">
                        Eat Right, Live Bright 🌱
                    </p>
                </motion.div>

                {/* Highlights */}
                <motion.div
                    style={{ y: highlightsY }}
                    className="flex flex-wrap justify-center gap-6 mb-14 text-black font-medium"
                >
                    {[
                        { icon: "🍽️", text: "2 meals per day (Lunch + Dinner)" },
                        { icon: "⚖️", text: "Balanced nutrition & macros" },
                        { icon: "✨", text: "No daily ordering hassle" },
                    ].map((highlight, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            whileHover={{ scale: 1.1, x: 10 }}
                            className="flex items-center gap-2"
                        >
                            <CheckCircle size={20} /> {highlight.text}
                        </motion.div>
                    ))}
                </motion.div>

                {/* Plans */}
                {loading ? (
                    <p className="text-black font-medium">Loading plans...</p>
                ) : (
                    <motion.div style={{ y: plansY }} className="mb-16">
                        <div className="grid md:grid-cols-3 gap-8">
                            {plans.map((plan, index) => {
                                const normalCost =
                                    plan.durationDays * dailyCost;
                                const savings = normalCost - plan.basePrice;
                                const discount = Math.round(
                                    (savings / normalCost) * 100
                                );

                                return (
                                    <motion.div
                                        key={plan._id}
                                        initial={{ opacity: 0, y: 30 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{
                                            delay: index * 0.1,
                                            duration: 0.6,
                                        }}
                                        viewport={{ once: true }}
                                        whileHover={{
                                            scale: 1.08,
                                            y: -10,
                                            rotateY: 5,
                                        }}
                                        className="
                    rounded-2xl p-6
                    bg-white/80 backdrop-blur-lg
                    shadow-xl text-black
                    border border-black/10
                    relative overflow-hidden group
                  "
                                    >
                                        {/* Animated background shine */}
                                        <motion.div
                                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                            initial={{ x: "-100%" }}
                                            whileHover={{ x: "100%" }}
                                            transition={{ duration: 0.6 }}
                                        />

                                        <div className="relative z-10">
                                            <h3 className="text-2xl font-bold mb-2">
                                                {plan.durationDays} Days Plan
                                            </h3>

                                            <p className="text-sm opacity-70 mb-4">
                                                {plan.durationDays * MEALS_PER_DAY} meals
                                                total
                                            </p>

                                            <motion.div
                                                className="mb-4"
                                                whileHover={{ scale: 1.05 }}
                                            >
                                                <p className="text-3xl font-extrabold">
                                                    ₹{plan.basePrice}
                                                </p>
                                                <p className="text-sm opacity-70">
                                                    ₹
                                                    {Math.round(
                                                        plan.basePrice /
                                                            plan.durationDays
                                                    )}
                                                    /day
                                                </p>
                                            </motion.div>

                                            <div className="text-sm mb-6">
                                                <p className="line-through opacity-60">
                                                    Daily order: ₹{normalCost}
                                                </p>
                                                <motion.p
                                                    className="font-semibold text-green-700"
                                                    whileHover={{ scale: 1.1 }}
                                                >
                                                    Save ₹{savings} ({discount}%)
                                                </motion.p>
                                            </div>

                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() =>
                                                    navigate("/subscription")
                                                }
                                                className="
                          w-full py-3 rounded-xl
                          bg-black text-white font-semibold
                          hover:bg-black/80 transition cursor-pointer
                        "
                                            >
                                                View Plan
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}

                {/* CTA */}
                <motion.div style={{ y: buttonY }}>
                    <motion.button
                        whileHover={{ scale: 1.08, boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate("/subscription")}
                        className="
            inline-flex items-center gap-3
            px-8 py-4 rounded-full
            bg-black text-white
            font-semibold text-lg shadow-xl hover:bg-black/80 transition cursor-pointer
          "
                    >
                        Compare All Plans
                        <motion.div
                            animate={{ x: [0, 5, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        >
                            <ArrowRight />
                        </motion.div>
                    </motion.button>
                </motion.div>
            </div>
        </motion.section>
    );
};

export default SubscriptionPromo;
