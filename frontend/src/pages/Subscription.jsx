import { useEffect, useState, useRef } from "react";
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
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [mySubscription, setMySubscription] = useState(null);
  const [error, setError] = useState(null);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [mealType, setMealType] = useState(null);
  const [expandedPlans, setExpandedPlans] = useState({});

  const planSummaryRef = useRef(null);

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
        console.log("Fetched plans:", data);
        setPlans(Array.isArray(data) ? data : []);
        
        // Set default selected plan if exists
        const savedPlan = localStorage.getItem('homieChefSelectedPlan');
        if (savedPlan) {
          const parsedPlan = JSON.parse(savedPlan);
          // Find the matching plan from fetched plans
          const matchedPlan = Array.isArray(data) ? data.find(p => p._id === parsedPlan._id) : null;
          if (matchedPlan) {
            setSelectedPlan(matchedPlan);
          }
        }
      } catch (err) {
        console.error("Error fetching plans:", err);
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
            setSelectedPlan(null);
            localStorage.removeItem('homieChefSelectedPlan');
          } catch {
            toast.error("Verification failed");
            setPaying(false);
          }
        },

        modal: {
          ondismiss: () => {
            setPaying(false);
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

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    localStorage.setItem('homieChefSelectedPlan', JSON.stringify(plan));
    
    // Scroll to plan summary
    setTimeout(() => {
      planSummaryRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'nearest'
      });
    }, 100);
    
    toast.success(`✅ ${plan.durationDays}-Day Plan Selected!`, { 
      style: {
        background: '#1F2937',
        color: '#fff',
        border: '1px solid #374151'
      }
    });
  };

  const togglePlanExpansion = (planId, e) => {
    e.stopPropagation();
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

  const getPlanDescription = (durationDays) => {
    if (durationDays === 7) return "Perfect for trying out our service";
    if (durationDays === 15) return "Save ₹300 compared to 7-day plan";
    if (durationDays === 30) return "Save ₹600 with long-term commitment";
    return "";
  };

  const calculateDailyPrice = (basePrice, durationDays) => {
    return Math.round(basePrice / durationDays);
  };

  // Helper to get macro values from meal object
  const getMealMacros = (meal) => {
    if (!meal) return { calories: 0, protein: 0, carbs: 0, fats: 0 };
    
    if (meal.macros) {
      return {
        calories: meal.macros.calories || 0,
        protein: meal.macros.protein || 0,
        carbs: meal.macros.carbs || 0,
        fats: meal.macros.fats || 0
      };
    }
    
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
      <div className="min-h-screen py-24 bg-linear-to-br from-[#0F1C2E] via-[#162A44] to-[#1F3A5F]">
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

  // Sort plans by duration (7, 15, 30 days)
  const sortedPlans = [...plans].sort((a, b) => a.durationDays - b.durationDays);

  return (
    <motion.div 
      className="min-h-screen bg-linear-to-br from-[#0F1C2E] via-[#162A44] to-[#1F3A5F] py-24"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="section-header text-center mb-10">
          <h2 className="text-3xl font-bold bg-linear-to-r text-white bg-clip-text mb-3">
            Choose Your Subscription Plan
          </h2>
          <p className="text-[#94A3B8] text-lg max-w-2xl mx-auto">
            Select the perfect plan for your healthy lifestyle
          </p>
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

        {/* All Plans in Vertical Format - No Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 my-8">
          {sortedPlans.map((plan) => {
            const dailyPrice = calculateDailyPrice(plan.basePrice, plan.durationDays);
            const badge = getPlanBadge(plan.durationDays);
            const description = getPlanDescription(plan.durationDays);
            const isSelected = selectedPlan?._id === plan._id;
            const isExpanded = expandedPlans[plan._id];
            
            return (
              <div
                key={plan._id}
                className={`bg-linear-to-br from-slate-800/90 to-slate-900/90 rounded-2xl p-6 border-2 transition-all duration-300 cursor-pointer relative h-fit overflow-hidden ${
                  isSelected 
                    ? 'border-[#F5C84C] bg-linear-to-br from-slate-800/95 to-slate-900/95 shadow-2xl shadow-yellow-500/30'
                    : 'border-white/10 hover:-translate-y-1 hover:border-[#F5C84C] hover:shadow-lg hover:shadow-yellow-500/20'
                }`}
                onClick={() => handleSelectPlan(plan)}
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 flex-wrap ">
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                    <h3 className="text-xl md:text-2xl font-bold text-white">
                      {plan.name}
                    </h3>
                    {badge && (
                      <span className="bg-linear-to-br from-[#F5C84C] to-[#FFD700] text-slate-800 px-4 py-1 rounded-full font-bold text-xs inline-block">
                        {badge}
                      </span>
                    )}
                  </div>
                  <div className="text-2xl md:text-3xl font-extrabold bg-linear-to-br from-[#F5C84C] to-[#FFD700] bg-clip-text text-transparent mt-2 md:mt-0">
                    ₹{dailyPrice}<span className="text-sm md:text-base">/Day</span>
                  </div>
                </div>
                <div className="text-[#94A3B8] text-sm mb-4">
                  <div className="text-base text-[#10B981] font-bold mb-1">
                    Total: ₹{plan.basePrice}
                  </div>
                  {description}
                </div>
                <div className="my-5 p-4 bg-white/5 rounded-xl">
                  {getFeatures(plan.durationDays).map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 mb-2 text-[#CBD5E1] text-sm">
                      <span className="text-[#10B981] font-bold">✓</span>
                      {feature}
                    </div>
                  ))}
                </div>

                {/* View Meals Button
                {!hasActiveSubscription && (
                  <button
                    onClick={(e) => togglePlanExpansion(plan._id, e)}
                    className="w-full mb-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <span>{isExpanded ? "Hide Meals" : "View All Meals"}</span>
                    <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                      ▼
                    </span>
                  </button>
                )}
                  */}

                {/* Expanded Meals Section */}
                {!hasActiveSubscription && isExpanded && (
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
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedMeal(lunchMeal);
                                    setMealType("lunch");
                                  }}
                                  className="text-yellow-400 hover:text-yellow-300 text-sm font-medium bg-gray-800/50 hover:bg-gray-700/50 px-3 py-1 rounded-lg transition-colors"
                                >
                                  View Details
                                </button>
                              </div>
                              <div className="text-white font-semibold mb-3 text-sm">{lunchMeal.name}</div>
                              
                              {/* Lunch Macros */}
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
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedMeal(dinnerMeal);
                                    setMealType("dinner");
                                  }}
                                  className="text-yellow-400 hover:text-yellow-300 text-sm font-medium bg-gray-800/50 hover:bg-gray-700/50 px-3 py-1 rounded-lg transition-colors"
                                >
                                  View Details
                                </button>
                              </div>
                              <div className="text-white font-semibold mb-3 text-sm">{dinnerMeal.name}</div>
                              
                              {/* Dinner Macros */}
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
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )} 

                {/* Select Plan Button */}
                {!hasActiveSubscription && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectPlan(plan);
                    }}
                    disabled={paying}
                    className={`w-full py-3.5 rounded-xl border-none font-bold cursor-pointer transition-all duration-300 ${
                      isSelected
                        ? "bg-linear-to-br from-[#F5C84C] to-[#FFD700] text-slate-800"
                        : "bg-linear-to-br from-[#10B981] to-[#3B82F6] text-white hover:scale-102 hover:shadow-lg hover:shadow-emerald-500/30"
                    }`}
                  >
                    {isSelected ? "SELECTED ✓" : "SELECT PLAN"}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Selected Plan Summary - Appears only when a plan is selected */}
        {selectedPlan && !hasActiveSubscription && (
          <div 
            ref={planSummaryRef}
            id="planSummary" 
            className="bg-linear-to-br from-slate-800/90 to-slate-900/90 rounded-2xl p-6 border-2 border-white/10 mt-8"
          >
            <h3 className="text-white text-xl font-bold mb-5">
              Selected Plan Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-[#94A3B8] text-sm">Selected Plan</div>
                <div className="text-white font-bold text-lg">{selectedPlan.durationDays} Days Plan</div>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-[#94A3B8] text-sm">Daily Cost</div>
                <div className="text-white font-bold text-lg">₹{calculateDailyPrice(selectedPlan.basePrice, selectedPlan.durationDays)}</div>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-[#94A3B8] text-sm">Total Amount</div>
                <div className="text-[#F5C84C] font-bold text-lg">₹{selectedPlan.basePrice}</div>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-[#94A3B8] text-sm">Duration</div>
                <div className="text-white font-bold text-lg">{selectedPlan.durationDays} days</div>
              </div>
            </div>
            <button
              className="w-full py-3.5 rounded-xl bg-linear-to-br from-[#F5C84C] to-[#EAB308] text-slate-800 font-bold cursor-pointer transition-all duration-300 hover:scale-102 hover:shadow-lg hover:shadow-yellow-500/30"
              onClick={() => handleSubscribe(selectedPlan)}
              disabled={paying}
            >
              {paying ? "Processing Payment..." : "PROCEED TO CHECKOUT"}
            </button>
            <p className="text-center text-gray-400 text-sm mt-4">
              Payment will open in a new window. Select "SELECT PLAN" to choose a different plan.
            </p>
          </div>
        )}

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
        {plans.length === 0 && !loading && (
          <div className="text-center py-16">
            <div className="text-6xl mb-6">📋</div>
            <h3 className="text-2xl font-bold text-white mb-4">No Plans Available</h3>
            <p className="text-gray-400 mb-6">
              Sorry, there are no subscription plans available at the moment.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-8 py-3 rounded-xl bg-linear-to-r from-yellow-500 to-amber-500 text-gray-900 font-bold hover:from-yellow-400 hover:to-amber-400"
            >
              Refresh Page
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Subscription;