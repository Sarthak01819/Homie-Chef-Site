import { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

const SubscriptionThaliCard = ({ mealType, day, mealData }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const dayName = dayNames[(day - 1) % 7];

  // Default ingredients based on meal type
  const getDefaultIngredients = () => {
    if (mealType === 'lunch') {
      return [
        { name: "3 Roti/Chapati", quantity: "3 pieces" },
        { name: "Fresh Salad", quantity: "1 bowl" },
        { name: "Achar/Pickle", quantity: "2 tbsp" },
        { name: "Raita/Dahi", quantity: "1 cup" },
        { name: "Main Curry", quantity: "2 bowls" },
        { name: "Steamed Rice", quantity: "1 bowl" },
        { name: "2 Gulab Jamun", quantity: "2 pieces" },
        { name: "Papad", quantity: "1 piece" }
      ];
    } else if (mealType === 'dinner') {
      return [
        { name: "2 Roti/Chapati", quantity: "2 pieces" },
        { name: "Fresh Salad", quantity: "1 bowl" },
        { name: "Achar/Pickle", quantity: "1 tbsp" },
        { name: "Raita/Dahi", quantity: "1 cup" },
        { name: "Main Curry/Dal", quantity: "1.5 bowls" },
        { name: "Khichdi/Rice", quantity: "1 bowl" },
        { name: "Seasonal Fruit", quantity: "1 serving" },
        { name: "Soup", quantity: "1 bowl" }
      ];
    }
    return [];
  };

  const ingredients = getDefaultIngredients();
  
  // Calculate macros for the thali
  const calculateThaliMacros = () => {
    if (mealType === 'lunch') {
      return {
        calories: 750,
        protein: 28,
        carbs: 110,
        fats: 22
      };
    } else if (mealType === 'dinner') {
      return {
        calories: 650,
        protein: 25,
        carbs: 95,
        fats: 18
      };
    }
    return { calories: 0, protein: 0, carbs: 0, fats: 0 };
  };

  const macros = calculateThaliMacros();
  
  // Price based on meal type
  const getPrice = () => {
    if (mealType === 'lunch') return 140;
    if (mealType === 'dinner') return 140;
    return 0;
  };

  const handleCustomize = () => {
    toast.success("Customization request sent! Our team will contact you.");
  };

  const handleTrackMeal = () => {
    window.location.href = "/tracker";
  };

  return (
    <motion.div
      className="
        rounded-2xl shadow-2xl overflow-hidden border-2
        bg-linear-to-br from-[#FFF8E1] to-[#F5F5F5]
        border-yellow-400
        w-full mb-8
      "
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="bg-linear-to-r from-yellow-500 to-amber-500 p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🍽️</span>
            <div>
              <h3 className="text-white text-xl font-bold">
                Your Subscription Thali - {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
              </h3>
              <p className="text-white/90 text-sm">Day {day} - {dayName} • Included in your plan</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-white/90">Price per thali</div>
              <div className="text-3xl font-extrabold text-white">
                ₹{getPrice()}
                <span className="text-lg font-normal ml-1">
                  <s className="text-white/70">₹{getPrice() + 50}</s>
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-white text-xl hover:bg-white/20 p-2 rounded-full transition-colors"
            >
              {isExpanded ? '▲' : '▼'}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Thali Image and Description */}
              <div className="lg:col-span-1">
                <div className="mb-4">
                  <div className="w-full h-48 rounded-xl overflow-hidden bg-linear-to-br from-amber-100 to-yellow-100 border-2 border-yellow-200 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-6xl mb-2">🍱</div>
                      <div className="text-amber-800 font-bold text-xl">Complete Thali</div>
                      <p className="text-amber-700 text-sm">Fresh & Hot Delivery</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <h4 className="text-amber-800 font-bold text-lg mb-2">Thali Description</h4>
                  <p className="text-amber-700 text-sm">
                    A complete balanced meal with traditional Indian dishes, served fresh daily. 
                    Perfect for a satisfying {mealType === 'lunch' ? 'midday' : 'evening'} meal.
                  </p>
                </div>
              </div>

              {/* Middle Column - Ingredients */}
              <div className="lg:col-span-1">
                <div className="mb-4">
                  <h4 className="text-gray-800 font-bold text-lg mb-3 flex items-center gap-2">
                    <span className="text-yellow-600">📋</span>
                    Thali Contents
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {ingredients.map((item, index) => (
                      <div
                        key={index}
                        className="bg-white border border-gray-200 rounded-lg p-3 hover:border-yellow-300 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-gray-800 font-medium text-sm">{item.name}</span>
                          <span className="text-yellow-600 font-bold text-xs bg-yellow-50 px-2 py-1 rounded">
                            {item.quantity}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column - Macros and Actions */}
              <div className="lg:col-span-1">
                <div className="mb-6">
                  <h4 className="text-gray-800 font-bold text-lg mb-3 flex items-center gap-2">
                    <span className="text-green-600">⚡</span>
                    Nutritional Value
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-linear-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                      <div className="text-green-800 text-sm font-medium mb-1">Calories</div>
                      <div className="text-green-900 text-2xl font-bold">{macros.calories} kcal</div>
                    </div>
                    <div className="bg-linear-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-4">
                      <div className="text-blue-800 text-sm font-medium mb-1">Protein</div>
                      <div className="text-blue-900 text-2xl font-bold">{macros.protein}g</div>
                    </div>
                    <div className="bg-linear-to-br from-purple-50 to-violet-50 border border-purple-200 rounded-xl p-4">
                      <div className="text-purple-800 text-sm font-medium mb-1">Carbs</div>
                      <div className="text-purple-900 text-2xl font-bold">{macros.carbs}g</div>
                    </div>
                    <div className="bg-linear-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-4">
                      <div className="text-orange-800 text-sm font-medium mb-1">Fats</div>
                      <div className="text-orange-900 text-2xl font-bold">{macros.fats}g</div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={handleTrackMeal}
                    className="w-full py-3 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 text-white font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2"
                  >
                    <span>📊 Track This Meal</span>
                  </button>
                  <button
                    onClick={handleCustomize}
                    className="w-full py-3 rounded-xl bg-linear-to-r from-amber-500 to-orange-500 text-white font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2"
                  >
                    <span>⚙️ Customize Thali</span>
                  </button>
                  <div className="text-center text-gray-600 text-xs">
                    This thali is included in your subscription plan
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default SubscriptionThaliCard;