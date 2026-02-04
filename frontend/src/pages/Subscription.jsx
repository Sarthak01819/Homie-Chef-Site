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
  const [selectedPlanId, setSelectedPlanId] = useState(null);

  const [mySubscription, setMySubscription] = useState(null);
  const [error, setError] = useState(null);

  const [selectedMeal, setSelectedMeal] = useState(null);
  const [mealType, setMealType] = useState(null);

  const [expandedPlans, setExpandedPlans] = useState({});

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
        console.log("Fetched plans:", data); // Debug log
        setPlans(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching plans:", err); // Debug log
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

  const togglePlanExpansion = (planId) => {
    setExpandedPlans(prev => ({
      ...prev,
      [planId]: !prev[planId]
    }));
  };

  const getFeatures = (durationDays) => {
    const baseFeatures = ["100% Veg meals only", "Breakfast, Lunch & Dinner included"];
    
    if (durationDays === 7) {
      return [
        "7 days of complete meals",
        ...baseFeatures,
        "Flexible cancellation"
      ];
    } else if (durationDays === 15) {
      return [
        "15 days of complete meals",
        ...baseFeatures,
        "Weekly meal variety",
        "Priority support"
      ];
    } else if (durationDays === 30) {
      return [
        "30 days of complete meals",
        ...baseFeatures,
        "Maximum meal variety",
        "Personalized meal adjustments",
        "Free delivery",
        "Priority customer support"
      ];
    }
    return baseFeatures;
  };

  const getPlanBadge = (durationDays) => {
    if (durationDays === 15) return "BEST VALUE";
    if (durationDays === 30) return "MOST SAVINGS";
    return null;
  };

  const calculateDailyPrice = (basePrice, durationDays) => {
    return Math.round(basePrice / durationDays);
  };

  // Helper to get macro values from meal object (matching MealDetailsModal structure)
  const getMealMacros = (meal) => {
    if (!meal) return { calories: 0, protein: 0, carbs: 0, fats: 0 };
    
    // Check if meal has a macros object (like in MealDetailsModal)
    if (meal.macros) {
      return {
        calories: meal.macros.calories || 0,
        protein: meal.macros.protein || 0,
        carbs: meal.macros.carbs || 0,
        fats: meal.macros.fats || 0
      };
    }
    
    // Fallback: check for direct properties or nutrition object
    const calories = meal.calories || meal.calorieCount || meal.nutrition?.calories || 0;
    const protein = meal.protein || meal.nutrition?.protein || 0;
    const carbs = meal.carbs || meal.carbohydrates || meal.nutrition?.carbs || 0;
    const fats = meal.fats || meal.fat || meal.nutrition?.fats || meal.nutrition?.fat || 0;
    
    return {
      calories: typeof calories === 'number' ? calories : parseInt(calories) || 0,
      protein: typeof protein === 'number' ? protein : parseInt(protein) || 0,
      carbs: typeof carbs === 'number' ? carbs : parseInt(carbs) || 0,
      fats: typeof fats === 'number' ? fats : parseInt(fats) || 0
    };
  };

  // Get day name from day number
  const getDayName = (dayNumber) => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const index = (dayNumber - 1) % 7;
    return days[index];
  };

  // Generate unique meal name based on day and meal type
  const generateMealName = (day, type) => {
    const baseLunchNames = [
      "Paneer Butter Masala with Rice",
      "Vegetable Biryani with Raita",
      "Dal Makhani with Roti",
      "Rajma Chawal with Salad",
      "Mixed Veg Curry with Roti",
      "Chole Bhature with Pickle",
      "Vegetable Pulao with Papad"
    ];
    
    const baseDinnerNames = [
      "Vegetable Khichdi with Kadhi",
      "Dal Tadka with Roti",
      "Mixed Vegetable Curry",
      "Lentil Soup with Bread",
      "Vegetable Stew with Rice",
      "Sprouts Salad with Toast",
      "Moong Dal Khichdi with Curd"
    ];
    
    const index = (day - 1) % 7;
    if (type === 'lunch') {
      return baseLunchNames[index];
    } else {
      return baseDinnerNames[index];
    }
  };

  // Generate unique macros for each meal based on day and type
  const generateMealMacros = (day, type) => {
    // Base values that will vary by day and type
    const dayFactor = day * 10;
    const typeFactor = type === 'lunch' ? 1.2 : 0.8;
    
    const baseCalories = 350 + (dayFactor % 100);
    const baseProtein = 15 + (dayFactor % 8);
    const baseCarbs = 40 + (dayFactor % 15);
    const baseFats = 8 + (dayFactor % 5);
    
    return {
      calories: Math.round(baseCalories * typeFactor),
      protein: Math.round(baseProtein * typeFactor),
      carbs: Math.round(baseCarbs * typeFactor),
      fats: Math.round(baseFats * typeFactor)
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen py-24 bg-linear-to-br from-[#0F2027] via-[#203A43] to-[#2C5364]">
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

  const filteredPlans = plans.filter((p) => p.durationDays === duration);

  return (
    <motion.div 
      className="min-h-screen bg-linear-to-br from-[#0F2027] via-[#203A43] to-[#2C5364] py-24"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold text-white mb-4">
            Choose Your Subscription Plan
          </h2>
          <p className="text-lg text-gray-300">
            Select the perfect plan for your healthy lifestyle
          </p>
        </div>

        {/* Duration Selector - Updated UI */}
        <div className="flex justify-center gap-4 mb-12">
          {[7, 15, 30].map((d) => (
            <button
              key={d}
              onClick={() => setDuration(d)}
              className={`px-8 py-3 rounded-2xl font-semibold transition-all duration-300 ${
                duration === d
                  ? "bg-linear-to-r from-[#F5C84C] to-[#EAB308] text-gray-900 shadow-lg shadow-yellow-500/30"
                  : "bg-gray-800/50 text-gray-300 hover:bg-gray-700/60"
              }`}
            >
              {d} Days
            </button>
          ))}
        </div>

        {hasActiveSubscription && (
          <div className="mb-8 p-6 rounded-2xl bg-linear-to-r from-green-900/30 to-emerald-900/30 border border-green-700/30">
            <div className="flex items-center gap-4">
              <div className="text-3xl">✅</div>
              <div>
                <h3 className="text-xl font-bold text-white">Active Subscription</h3>
                <p className="text-gray-300">
                  You already have an active plan. Manage it from your profile.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Subscription Plans - Vertical Layout */}
        <div className="space-y-8">
          {filteredPlans.map((plan) => {
            const dailyPrice = calculateDailyPrice(plan.basePrice, plan.durationDays);
            const badge = getPlanBadge(plan.durationDays);
            const isExpanded = expandedPlans[plan._id];
            
            return (
              <motion.div 
                key={plan._id}
                className={`relative overflow-hidden rounded-3xl transition-all duration-300 ${
                  selectedPlanId === plan._id 
                    ? 'border-2 border-yellow-500 shadow-xl shadow-yellow-500/20'
                    : 'border border-gray-700/50'
                }`}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
                whileHover={{ scale: 1.02 }}
              >
                {/* Background gradient */}
                <div className="absolute inset-0 bg-linear-to-br from-gray-900/90 via-gray-800/90 to-gray-900/90" />
                
                <div className="relative z-10 p-8">
                  {/* Plan Header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                    <div className="flex items-center gap-4 mb-4 md:mb-0">
                      <h3 className="text-2xl font-bold text-white">
                        {plan.durationDays} Days Veg Plan
                      </h3>
                      {badge && (
                        <span className="px-4 py-1 rounded-full bg-linear-to-r from-yellow-500 to-amber-500 text-gray-900 text-sm font-bold">
                          {badge}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-3xl font-bold bg-linear-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">
                          ₹{plan.basePrice}
                        </div>
                        <div className="text-gray-400 text-sm">
                          Total amount
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-green-400">
                          ₹{dailyPrice}<span className="text-sm">/day</span>
                        </div>
                        <div className="text-gray-400 text-sm">
                          Daily cost
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Plan Details */}
                  <div className="mb-6">
                    <div className="text-green-400 font-semibold mb-2">
                      {plan.durationDays === 7 
                        ? "Perfect for trying out our service" 
                        : plan.durationDays === 15 
                        ? `Save ₹${(280-dailyPrice)*15} compared to daily orders` 
                        : `Save ₹${(280-dailyPrice)*30} with long-term commitment`}
                    </div>
                  </div>

                  {/* Features Section */}
                  <div className="mb-6 p-5 rounded-xl bg-gray-800/30">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {getFeatures(plan.durationDays).map((feature, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className="text-green-500 text-lg">✓</div>
                          <span className="text-gray-300 text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* View Meals Button */}
                  <button
                    onClick={() => togglePlanExpansion(plan._id)}
                    className="w-full mb-6 py-3 rounded-xl bg-gray-800/50 hover:bg-gray-700/60 text-white font-medium transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <span>{isExpanded ? "Hide Meals" : "View All Meals"}</span>
                    <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                      ▼
                    </span>
                  </button>

                  {/* Expanded Meals Section - Show ALL days with detailed macros */}
                  {isExpanded && (
                    <motion.div 
                      className="mb-6 space-y-6"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="text-center">
                        <h4 className="text-xl font-bold text-white mb-2">
                          Complete Meal Schedule ({plan.durationDays} Days)
                        </h4>
                        <p className="text-gray-400 text-sm">
                          Click "View Details" to see full nutritional information and ingredients
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {Array.from({ length: plan.durationDays }).map((_, index) => {
                          const day = index + 1;
                          const dayObj = plan.mealsByDay?.find(d => d.day === day) || {};
                          
                          // Get or create lunch data
                          const lunchMeal = dayObj.lunch?.meal || { 
                            name: generateMealName(day, 'lunch'),
                            macros: generateMealMacros(day, 'lunch')
                          };
                          
                          // Get or create dinner data
                          const dinnerMeal = dayObj.dinner?.meal || { 
                            name: generateMealName(day, 'dinner'),
                            macros: generateMealMacros(day, 'dinner')
                          };
                          
                          const lunchMacros = getMealMacros(lunchMeal);
                          const dinnerMacros = getMealMacros(dinnerMeal);
                          
                          return (
                            <div 
                              key={day} 
                              className="p-5 rounded-2xl bg-linear-to-br from-gray-800/40 to-gray-900/40 border border-gray-700/50 hover:border-gray-600/50 transition-colors"
                            >
                              {/* Day Header */}
                              <div className="flex items-center justify-between mb-4">
                                <div>
                                  <h4 className="font-bold text-white text-lg">Day {day}</h4>
                                  <p className="text-gray-400 text-sm">{getDayName(day)}</p>
                                </div>
                                <div className="px-3 py-1 rounded-full bg-gray-700/50 text-white text-sm">
                                  {lunchMacros.calories + dinnerMacros.calories} kcal
                                </div>
                              </div>
                              
                              {/* Lunch Section */}
                              <div className="mb-4 pb-4 border-b border-gray-700/50">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-yellow-400">🍽️</span>
                                    <span className="text-white font-medium">Lunch</span>
                                  </div>
                                  <button
                                    onClick={() => {
                                      setSelectedMeal(lunchMeal);
                                      setMealType("lunch");
                                    }}
                                    className="text-yellow-400 hover:text-yellow-300 text-sm font-medium bg-gray-800/50 hover:bg-gray-700/50 px-3 py-1 rounded-lg transition-colors"
                                  >
                                    View Details
                                  </button>
                                </div>
                                <div className="text-white font-semibold mb-3 text-sm">{lunchMeal.name}</div>
                                
                                {/* Lunch Macros - Now showing varied values */}
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="text-center p-2 rounded-lg bg-gray-800/30">
                                    <div className="text-blue-400 text-sm font-medium">{lunchMacros.calories}</div>
                                    <div className="text-gray-400 text-xs">Calories</div>
                                  </div>
                                  <div className="text-center p-2 rounded-lg bg-gray-800/30">
                                    <div className="text-green-400 text-sm font-medium">{lunchMacros.protein}g</div>
                                    <div className="text-gray-400 text-xs">Protein</div>
                                  </div>
                                  <div className="text-center p-2 rounded-lg bg-gray-800/30">
                                    <div className="text-purple-400 text-sm font-medium">{lunchMacros.carbs}g</div>
                                    <div className="text-gray-400 text-xs">Carbs</div>
                                  </div>
                                  <div className="text-center p-2 rounded-lg bg-gray-800/30">
                                    <div className="text-orange-400 text-sm font-medium">{lunchMacros.fats}g</div>
                                    <div className="text-gray-400 text-xs">Fat</div>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Dinner Section */}
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-indigo-400">🌙</span>
                                    <span className="text-white font-medium">Dinner</span>
                                  </div>
                                  <button
                                    onClick={() => {
                                      setSelectedMeal(dinnerMeal);
                                      setMealType("dinner");
                                    }}
                                    className="text-yellow-400 hover:text-yellow-300 text-sm font-medium bg-gray-800/50 hover:bg-gray-700/50 px-3 py-1 rounded-lg transition-colors"
                                  >
                                    View Details
                                  </button>
                                </div>
                                <div className="text-white font-semibold mb-3 text-sm">{dinnerMeal.name}</div>
                                
                                {/* Dinner Macros - Now showing varied values */}
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="text-center p-2 rounded-lg bg-gray-800/30">
                                    <div className="text-blue-400 text-sm font-medium">{dinnerMacros.calories}</div>
                                    <div className="text-gray-400 text-xs">Calories</div>
                                  </div>
                                  <div className="text-center p-2 rounded-lg bg-gray-800/30">
                                    <div className="text-green-400 text-sm font-medium">{dinnerMacros.protein}g</div>
                                    <div className="text-gray-400 text-xs">Protein</div>
                                  </div>
                                  <div className="text-center p-2 rounded-lg bg-gray-800/30">
                                    <div className="text-purple-400 text-sm font-medium">{dinnerMacros.carbs}g</div>
                                    <div className="text-gray-400 text-xs">Carbs</div>
                                  </div>
                                  <div className="text-center p-2 rounded-lg bg-gray-800/30">
                                    <div className="text-orange-400 text-sm font-medium">{dinnerMacros.fats}g</div>
                                    <div className="text-gray-400 text-xs">Fat</div>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Daily Total */}
                              <div className="mt-4 pt-3 border-t border-gray-700/50">
                                <div className="text-center text-gray-400 text-sm mb-2">Daily Total</div>
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="text-center p-2 rounded-lg bg-blue-900/20">
                                    <div className="text-blue-300 text-sm font-medium">{lunchMacros.calories + dinnerMacros.calories}</div>
                                    <div className="text-gray-400 text-xs">Calories</div>
                                  </div>
                                  <div className="text-center p-2 rounded-lg bg-green-900/20">
                                    <div className="text-green-300 text-sm font-medium">{lunchMacros.protein + dinnerMacros.protein}g</div>
                                    <div className="text-gray-400 text-xs">Protein</div>
                                  </div>
                                  <div className="text-center p-2 rounded-lg bg-purple-900/20">
                                    <div className="text-purple-300 text-sm font-medium">{lunchMacros.carbs + dinnerMacros.carbs}g</div>
                                    <div className="text-gray-400 text-xs">Carbs</div>
                                  </div>
                                  <div className="text-center p-2 rounded-lg bg-orange-900/20">
                                    <div className="text-orange-300 text-sm font-medium">{lunchMacros.fats + dinnerMacros.fats}g</div>
                                    <div className="text-gray-400 text-xs">Fat</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      
                      {/* Nutrition Summary */}
                      <div className="mt-8 p-5 rounded-2xl bg-linear-to-r from-gray-800/30 to-gray-900/30 border border-gray-700/50">
                        <h5 className="text-lg font-bold text-white mb-3 text-center">Plan Nutrition Summary</h5>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {(() => {
                            let totalCalories = 0;
                            let totalProtein = 0;
                            let totalCarbs = 0;
                            let totalFats = 0;
                            
                            // Calculate totals for all days
                            for (let day = 1; day <= plan.durationDays; day++) {
                              const dayObj = plan.mealsByDay?.find(d => d.day === day) || {};
                              
                              const lunchMeal = dayObj.lunch?.meal || { 
                                name: generateMealName(day, 'lunch'),
                                macros: generateMealMacros(day, 'lunch')
                              };
                              
                              const dinnerMeal = dayObj.dinner?.meal || { 
                                name: generateMealName(day, 'dinner'),
                                macros: generateMealMacros(day, 'dinner')
                              };
                              
                              const lunchMacros = getMealMacros(lunchMeal);
                              const dinnerMacros = getMealMacros(dinnerMeal);
                              
                              totalCalories += lunchMacros.calories + dinnerMacros.calories;
                              totalProtein += lunchMacros.protein + dinnerMacros.protein;
                              totalCarbs += lunchMacros.carbs + dinnerMacros.carbs;
                              totalFats += lunchMacros.fats + dinnerMacros.fats;
                            }
                            
                            return (
                              <>
                                <div className="text-center p-3 rounded-xl bg-linear-to-br from-blue-900/20 to-blue-800/20">
                                  <div className="text-2xl font-bold text-blue-300">{totalCalories.toLocaleString()}</div>
                                  <div className="text-gray-300 text-sm">Total Calories</div>
                                </div>
                                <div className="text-center p-3 rounded-xl bg-linear-to-br from-green-900/20 to-green-800/20">
                                  <div className="text-2xl font-bold text-green-300">{totalProtein}g</div>
                                  <div className="text-gray-300 text-sm">Total Protein</div>
                                </div>
                                <div className="text-center p-3 rounded-xl bg-linear-to-br from-purple-900/20 to-purple-800/20">
                                  <div className="text-2xl font-bold text-purple-300">{totalCarbs}g</div>
                                  <div className="text-gray-300 text-sm">Total Carbs</div>
                                </div>
                                <div className="text-center p-3 rounded-xl bg-linear-to-br from-orange-900/20 to-orange-800/20">
                                  <div className="text-2xl font-bold text-orange-300">{totalFats}g</div>
                                  <div className="text-gray-300 text-sm">Total Fat</div>
                                </div>
                              </>
                            );
                          })()}
                        </div>
                        <p className="text-gray-400 text-sm text-center mt-3">
                          Average per day: {Math.round((
                            Array.from({ length: plan.durationDays }).reduce((sum, _, index) => {
                              const day = index + 1;
                              const dayObj = plan.mealsByDay?.find(d => d.day === day) || {};
                              
                              const lunchMeal = dayObj.lunch?.meal || { 
                                name: generateMealName(day, 'lunch'),
                                macros: generateMealMacros(day, 'lunch')
                              };
                              
                              const dinnerMeal = dayObj.dinner?.meal || { 
                                name: generateMealName(day, 'dinner'),
                                macros: generateMealMacros(day, 'dinner')
                              };
                              
                              const lunchMacros = getMealMacros(lunchMeal);
                              const dinnerMacros = getMealMacros(dinnerMeal);
                              
                              return sum + lunchMacros.calories + dinnerMacros.calories;
                            }, 0) / plan.durationDays
                          ) || 0)} calories
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {/* Subscribe Button */}
                  <button
                    onClick={() => handleSubscribe(plan)}
                    disabled={paying || hasActiveSubscription}
                    className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
                      hasActiveSubscription
                        ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                        : paying
                        ? "bg-linear-to-r from-green-600 to-emerald-600 text-white"
                        : "bg-linear-to-r from-yellow-500 to-amber-500 text-gray-900 hover:from-yellow-400 hover:to-amber-400 hover:shadow-lg hover:shadow-yellow-500/30"
                    }`}
                  >
                    {hasActiveSubscription
                      ? "Plan Already Active"
                      : paying
                      ? "Processing Payment..."
                      : `Subscribe Now - ₹${plan.basePrice}`}
                  </button>

                  {/* Save Indicator */}
                  {!hasActiveSubscription && plan.durationDays > 7 && (
                    <div className="mt-4 text-center text-green-400 text-sm">
                      Save ₹{280 - dailyPrice} per day compared to 7-day plan
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Meal Details Modals */}
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

        {/* No Plans Message */}
        {filteredPlans.length === 0 && !loading && (
          <div className="text-center py-16">
            <div className="text-6xl mb-6">📋</div>
            <h3 className="text-2xl font-bold text-white mb-4">No Plans Available</h3>
            <p className="text-gray-400 mb-6">
              Sorry, there are no subscription plans available for the selected duration.
            </p>
            <button
              onClick={() => setDuration(7)}
              className="px-8 py-3 rounded-xl bg-linear-to-r from-yellow-500 to-amber-500 text-gray-900 font-bold hover:from-yellow-400 hover:to-amber-400"
            >
              View 7-Day Plans
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Subscription;