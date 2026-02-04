import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import Skeleton from "../components/Skeleton";
import { apiFetch } from "../services/api";

import MealDetailsModal from "../components/MealDetailsModal";
import MealDetailsSheet from "../components/MealDetailSheet";
import ErrorState from "../components/ErrorState";

const Subscription = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [razorpayReady, setRazorpayReady] = useState(false);

  const [duration, setDuration] = useState(7);
  const [expandedPlan, setExpandedPlan] = useState(null);

  const [mySubscription, setMySubscription] = useState(null);
  const [error, setError] = useState(null);

  const [selectedMeal, setSelectedMeal] = useState(null);
  const [mealType, setMealType] = useState(null);

  const customizations = {
    exclusions: [],
    spiceLevel: "medium",
    notes: "",
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
        setError(null);
        const data = await apiFetch(
          `${import.meta.env.VITE_API_URL}/subscriptions`
        );
        setPlans(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err);
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
    if (paying || hasActiveSubscription) return;

    if (!razorpayReady) {
      toast.error("Payment gateway still loading. Please wait.");
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
              setPaying(false);
              return;
            }

            toast.success("Subscription activated 🎉");
            setMySubscription(verifyData.subscription);
          } catch {
            toast.error("Verification failed");
            setPaying(false);
          }
        },

        modal: {
          ondismiss: () => {
            setPaying(false); // payment cancelled
          },
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
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        message="Failed to load subscription plans"
        onRetry={() => window.location.reload()}
      />
    );
  }

  const filteredPlans = plans.filter(
    (p) => p.durationDays === duration
  );

  return (
    <motion.div className="min-h-screen bg-linear-to-br from-[#0F2027] via-[#203A43] to-[#2C5364] py-24">
      <motion.div className="max-w-6xl mx-auto px-4 py-8 bg-linear-to-r from-[#119DA4]/90 to-[#FDE789]/90 rounded-3xl">
        <h1 className="text-3xl font-bold text-center mb-6">
          Subscription Plans
        </h1>

        {/* Duration Selector */}
        <div className="flex justify-center gap-3 mb-8">
          {[7, 15, 30].map((d) => (
            <button
              key={d}
              onClick={() => setDuration(d)}
              className={`px-5 py-2 rounded-xl border cursor-pointer ${
                duration === d
                  ? "bg-green-800/80 text-white"
                  : "bg-white hover:bg-green-200/60"
              }`}
            >
              {d} Days
            </button>
          ))}
        </div>

        {filteredPlans.map((plan) => (
          <div key={plan._id} className=" p-5 rounded-2xl mb-6 bg-white shadow-md">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold">
                {plan.durationDays} Days Veg Plan
              </h2>

              <span className="text-lg font-bold text-green-700">
                ₹{plan.basePrice}
              </span>
            </div>

            <button
              onClick={() =>
                setExpandedPlan(
                  expandedPlan === plan._id ? null : plan._id
                )
              }
              className="text-green-700 font-medium mb-3 py-4 px-6 cursor-pointer shadow-md rounded-lg hover:bg-green-100 transition"
            >
              {expandedPlan === plan._id ? "Hide Meals" : "View Meals"}
            </button>

            {expandedPlan === plan._id &&
              plan.mealsByDay?.map((dayObj) => {
                const lunch = dayObj.lunch?.meal;
                const dinner = dayObj.dinner?.meal;

                return (
                  <div
                    key={dayObj.day}
                    className="border rounded-xl p-4 mt-3 space-y-2"
                  >
                    <p className="font-medium">Day {dayObj.day}</p>

                    {lunch && (
                      <div className="flex justify-between items-center text-sm border-b pb-2 border-gray-200">
                        <span>
                          Lunch: <b>{lunch.name}</b>
                        </span>
                        <button
                          onClick={() => {
                            setSelectedMeal(lunch);
                            setMealType("lunch");
                          }}
                          className="text-green-700 font-medium cursor-pointer px-4 py-2 shadow-md rounded-lg hover:bg-green-100 transition"
                        >
                          View More
                        </button>
                      </div>
                    )}

                    {dinner && (
                      <div className="flex justify-between items-center text-sm">
                        <span>
                          Dinner: <b>{dinner.name}</b>
                        </span>
                        <button
                          onClick={() => {
                            setSelectedMeal(dinner);
                            setMealType("dinner");
                          }}
                          className="text-green-700 font-medium cursor-pointer px-4 py-2 shadow-md rounded-lg hover:bg-green-100 transition"
                        >
                          View More
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}

            <button
              onClick={() => handleSubscribe(plan)}
              disabled={paying || hasActiveSubscription}
              className={`w-full mt-4 py-3 rounded-xl font-medium transition cursor-pointer ${
                hasActiveSubscription
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : paying
                  ? "bg-green-700 text-white"
                  : "bg-black text-white hover:bg-green-700"
              }`}
            >
              {hasActiveSubscription
                ? "Plan already activated"
                : paying
                ? "Processing..."
                : "Pay to Subscribe"}
            </button>
          </div>
        ))}

        {selectedMeal && (
          <>
            <div className="hidden md:block">
              <MealDetailsModal
                meal={selectedMeal}
                type={mealType}
                onClose={() => setSelectedMeal(null)}
              />
            </div>

            <div className="md:hidden">
              <MealDetailsSheet
                meal={selectedMeal}
                type={mealType}
                onClose={() => setSelectedMeal(null)}
              />
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
};

export default Subscription;
