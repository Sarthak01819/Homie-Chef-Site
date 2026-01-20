import { useEffect, useState } from "react";
import Loader from "../components/Loader";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import Skeleton from "../components/Skeleton";
import { apiFetch } from "../services/api";

const Subscription = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [razorpayReady, setRazorpayReady] = useState(false);

  const [duration, setDuration] = useState(7);
  const [expandedPlan, setExpandedPlan] = useState(null);
  const [expandedMeal, setExpandedMeal] = useState(null);

  const [mySubscription, setMySubscription] = useState(null);
  const [error, setError] = useState(null);

  const customizations = {
    exclusions: [],
    spiceLevel: "medium",
    notes: "",
  };

  const fetchPlans = async () => {
    try {
      setError(null);
      const data = await apiFetch(
        `${import.meta.env.VITE_API_URL}/subscriptions`
      );
      setPlans(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     LOAD RAZORPAY SCRIPT
  ========================= */
  useEffect(() => {
    if (window.Razorpay) {
      setRazorpayReady(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;

    script.onload = () => setRazorpayReady(true);
    script.onerror = () =>
      toast.error("Failed to load payment gateway");

    document.body.appendChild(script);
  }, []);

  /* =========================
     FETCH SUBSCRIPTION PLANS
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
        toast.error("Failed to load subscription plans");
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  /* =========================
     FETCH ACTIVE SUBSCRIPTION
  ========================= */
  useEffect(() => {
    const fetchMySubscription = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/subscriptions/my`,
          { credentials: "include" }
        );

        if (!res.ok) return;
        const data = await res.json();
        setMySubscription(data || null);
      } catch {
        setMySubscription(null);
      }
    };

    fetchMySubscription();
  }, []);

  const hasActiveSubscription = Boolean(mySubscription);

  /* =========================
     SUBSCRIBE + PAY
  ========================= */
  const handleSubscribe = async (plan) => {
    if (paying) return;

    if (!razorpayReady) {
      toast.error("Payment gateway still loading. Please wait.");
      return;
    }

    if (hasActiveSubscription) {
      toast.error(
        "You already have an active subscription. Cancel it to buy a new one."
      );
      return;
    }

    setPaying(true);

    try {
      const orderRes = await fetch(
        `${import.meta.env.VITE_API_URL}/payments/create-order`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ planId: plan._id }),
        }
      );

      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        toast.error(orderData.message || "Payment initiation failed");
        setPaying(false);
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Homie Chef",
        description: "Vegetarian Subscription",
        order_id: orderData.orderId,

        handler: async (response) => {
          try {
            const verifyRes = await fetch(
              `${import.meta.env.VITE_API_URL}/payments/verify`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  planId: plan._id,
                  customizations,
                }),
              }
            );

            const verifyData = await verifyRes.json();

            if (!verifyRes.ok) {
              toast.error(
                verifyData.message || "Payment verification failed"
              );
              return;
            }

            toast.success("Subscription activated 🎉");
            setMySubscription(verifyData.subscription);
          } catch {
            toast.error("Verification failed");
          } finally {
            setPaying(false);
          }
        },

        theme: { color: "#1F8A5B" },
      };

      new window.Razorpay(options).open();
    } catch (err) {
      console.error(err);
      toast.error("Payment failed");
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-24">
        <div className="max-w-6xl mx-auto px-4 space-y-8">
          <Skeleton className="h-8 w-64 mx-auto" />
          <Skeleton className="h-5 w-48 mx-auto" />

          <div className="flex justify-center gap-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-10 w-24 rounded-xl" />
            ))}
          </div>

          {[1, 2].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-6 shadow space-y-4"
            >
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
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
          fetchPlans();
        }}
      />
    );
  }

  const filteredPlans = plans.filter(
    (p) => p.durationDays === duration
  );

  return (
    <motion.div className="min-h-screen bg-green-800/80 py-24">
      <motion.div
        className="max-w-6xl mx-auto px-4 py-8 bg-green-100/60 rounded-3xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-bold text-center mb-2">
          Subscription Plans
        </h1>

        <p className="text-center font-medium mb-6">
          🌱 100% Vegetarian Meals
        </p>

        {/* Duration Selector */}
        <div className="flex justify-center gap-3 mb-8">
          {[7, 15, 30].map((d) => (
            <motion.button
              key={d}
              onClick={() => setDuration(d)}
              className={`px-5 py-2 rounded-xl border font-medium transition ${duration === d
                ? "bg-green-800/80 text-white"
                : "bg-white hover:bg-green-100"
                }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {d} Days
            </motion.button>
          ))}
        </div>

        {/* Plans */}
        <div>
          {filteredPlans.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="text-6xl mb-4">🥗</div>
              <h2 className="text-2xl font-semibold mb-2">
                Plans coming soon
              </h2>
              <p className="text-gray-600 max-w-md">
                We’re preparing fresh vegetarian meal plans for this duration.
                Please try another plan.
              </p>
            </motion.div>
          ) : (
            filteredPlans.map((plan) => (
              <motion.div
                key={plan._id}
                layout
                className="rounded-2xl shadow-md p-5 mb-6 border bg-white"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-semibold">
                      {plan.durationDays} Days Veg Plan
                    </h2>
                    <p className="text-gray-600">
                      ₹{plan.basePrice}
                    </p>
                  </div>

                  <motion.button
                    onClick={() =>
                      setExpandedPlan(
                        expandedPlan === plan._id ? null : plan._id
                      )
                    }
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 rounded-xl border hover:bg-green-800/80 hover:text-white transition"
                  >
                    {expandedPlan === plan._id
                      ? "Hide Meals"
                      : "View Meals"}
                  </motion.button>
                </div>

                <AnimatePresence>
                  {expandedPlan === plan._id && (
                    <motion.div
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="mt-5 border-t pt-4 space-y-3"
                    >
                      {plan.mealsByDay?.map(({ meal }, idx) => {
                        if (!meal) return null;
                        const macros = meal.macros || {};

                        return (
                          <motion.div
                            key={idx}
                            layout
                            className="border rounded-xl p-3"
                          >
                            <div className="flex justify-between items-center">
                              <p className="font-medium">
                                Day {idx + 1} — {meal.name}
                              </p>

                              <motion.button
                                onClick={() =>
                                  setExpandedMeal(
                                    expandedMeal === `${plan._id}-${idx}`
                                      ? null
                                      : `${plan._id}-${idx}`
                                  )
                                }
                                whileHover={{ scale: 1.05 }}
                                className="text-sm text-green-700"
                              >
                                {expandedMeal === `${plan._id}-${idx}`
                                  ? "Hide Macros"
                                  : "View Macros"}
                              </motion.button>
                            </div>

                            <AnimatePresence>
                              {expandedMeal === `${plan._id}-${idx}` && (
                                <motion.div
                                  initial={{ opacity: 0, y: 6 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: 6 }}
                                  className="text-sm mt-2 grid grid-cols-2 md:grid-cols-4 gap-4"
                                >
                                  <p><b>Calories:</b> {macros.calories ?? "N/A"}</p>
                                  <p><b>Protein:</b> {macros.protein ?? "N/A"}g</p>
                                  <p><b>Carbs:</b> {macros.carbs ?? "N/A"}g</p>
                                  <p><b>Fats:</b> {macros.fats ?? "N/A"}g</p>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        );
                      })}

                      <button
                        disabled={paying || hasActiveSubscription || !razorpayReady}
                        onClick={() => handleSubscribe(plan)}
                        className={`w-full py-3 rounded-xl font-medium transition ${hasActiveSubscription || !razorpayReady
                          ? "bg-gray-300 text-gray-600"
                          : "bg-linear-to-r from-[#4B0C37] to-[#119DA4] text-white hover:from-[#119DA4] hover:to-[#4B0C37] transition-all duration-300"
                          }`}
                      >
                        {!razorpayReady
                          ? "Loading Payment Gateway..."
                          : hasActiveSubscription
                            ? "Active subscription exists"
                            : paying
                              ? "Processing..."
                              : "Pay to Subscribe"}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          )}
        </div>

      </motion.div>
    </motion.div>
  );
};

export default Subscription;
