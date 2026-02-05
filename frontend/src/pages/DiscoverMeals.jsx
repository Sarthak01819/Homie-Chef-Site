import { useEffect, useState, useCallback, useMemo, memo } from "react";
import { Heart, ShoppingCart } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import ErrorState from "../components/ErrorState";
import SubscriptionThaliCard from "../components/SubscriptionThaliCard"; // Import the new component

/* =========================
   STAR RATING COMPONENT
========================= */
const StarRating = memo(({ value, onRate }) => {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => onRate(star)}
          className={`text-xl transition-colors duration-300 ${star <= value ? "" : ""}`}
          style={star <= value ? { color: '#2ECC71' } : { color: '#CCCCCC' }}
        >
          ★
        </button>
      ))}
    </div>
  );
});

/* =========================
   MEAL CARD
========================= */
const MealCard = memo(({ meal }) => {
  const { user, setUser } = useAuth();

  const isLiked = user?.favourites?.some((fav) =>
    typeof fav === "string"
      ? fav === meal._id
      : fav?._id === meal._id
  );


  // ✅ FIX: cart now stores objects { meal, quantity }
  const inCart = user?.cart?.some(
    (item) => item.meal?.toString() === meal._id
  );

  const userRating =
    user?.ratings?.find((r) => r.mealId === meal._id)?.rating || 0;

  /* ❤️ Toggle Favourite */
  const toggleLike = useCallback(async () => {
    if (!user) return toast.error("Login to like meals");

    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/meals/${meal._id}/favourite`,
      {
        method: "POST",
        credentials: "include",
      }
    );

    const data = await res.json();
    setUser({
      ...user,
      favourites: data.favourites.map((id) => id.toString()),
    });
  }, [meal._id, user, setUser]);

  /* 🛒 Add to Cart */
  const addToCart = useCallback(async () => {
    if (!user) return toast.error("Login to add items to cart");

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/meals/${meal._id}/cart`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to add to cart");
        return;
      }

      // ✅ SUCCESS TOAST
      toast.success("Meal added in cart 🛒");

      setUser({ ...user, cart: data.cart });
    } catch {
      toast.error("Something went wrong");
    }
  }, [meal._id, user, setUser]);

  /* ⭐ Rate Meal */
  const rateMeal = useCallback(async (rating) => {
    if (!user) return toast.error("Login to rate meals");

    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/meals/${meal._id}/rate`,
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating }),
      }
    );

    const data = await res.json();

    setUser({
      ...user,
      ratings: [
        ...(user.ratings || []).filter((r) => r.mealId !== meal._id),
        { mealId: meal._id, rating },
      ],
    });

    meal.avgRating = data.avgRating;
  }, [meal, user, setUser]);

  return (
    <motion.div
      className="
    rounded-2xl shadow-lg overflow-hidden hover:shadow-xl
    transition-all duration-300 relative border-2
    bg-[#F9F9F9] border-[#CCCCCC]

    flex flex-row md:flex-col
    w-full md:w-98
  "
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#235E3A")}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#CCCCCC")}
      whileHover={{ scale: 1.05 }}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
    >
      {/* ❤️ Like Button */}
      <button className="absolute top-3 right-3 z-10" onClick={toggleLike}>
        <Heart
          size={24}
          className="transition-colors duration-300"
          style={
            isLiked
              ? { fill: "#F01D1D", color: "#F01D1D" }
              : { fill: "none", color: "#CCCCCC" }
          }
        />
      </button>

      {/* 🖼 Image */}
      <img
        src={meal.image}
        alt={meal.name}
        loading="lazy"
        className="
      object-cover
      w-32 h-32
      md:w-full md:h-48
      shrink-0
    "
      />

      {/* 📦 Content */}
      <div className="p-4 md:p-5 flex flex-col justify-between flex-1">
        <div>
          <div className="flex justify-between items-center mb-1">
            <h2 className="text-lg font-semibold text-black">
              {meal.name}
            </h2>
            <span className="font-bold text-black">
              ₹{meal.price}
            </span>
          </div>

          {/* ⭐ Rating */}
          <div className="flex items-center justify-between mb-3">
            <StarRating value={userRating} onRate={rateMeal} />
            <span className="text-sm text-[#666666]">
              Avg ⭐ {meal.avgRating.toFixed(1)}
            </span>
          </div>

          {/* Macros */}
          <div className="text-sm grid grid-cols-2 gap-y-1 mb-4 text-[#666666]">
            <p>Protein: {meal.macros.protein}g</p>
            <p>Carbs: {meal.macros.carbs}g</p>
            <p>Fats: {meal.macros.fats}g</p>
            <p>Calories: {meal.macros.calories}</p>
          </div>
        </div>

        {/* 🛒 Add to Cart */}
        <div>
          <button
            onClick={addToCart}
            disabled={inCart}
            className={`
          w-full flex items-center justify-center gap-2 py-2 rounded-xl
          transition-all duration-300 font-medium
          ${inCart
                ? "cursor-not-allowed opacity-60 bg-[#CCCCCC] text-[#666666]"
                : "bg-black text-white hover:opacity-90 hover:shadow-lg"
              }
        `}
          >
            <ShoppingCart size={18} />
            {inCart ? "Added to Cart" : "Add to Cart"}
          </button>

          {/* Veg / Non-Veg Tag */}
          <span
            className="inline-block mt-3 px-3 py-1 text-xs rounded-full font-medium"
            style={
              (meal.category || meal.type) === "veg"
                ? {
                  backgroundColor: "rgba(46, 204, 113, 0.2)",
                  color: "#2ECC71",
                }
                : {
                  backgroundColor: "rgba(204, 204, 204, 0.2)",
                  color: "#666666",
                }
            }
          >
            {(meal.category || meal.type) === "veg" ? "Veg" : "Non-Veg"}
          </span>
        </div>
      </div>
    </motion.div>

  );
});

/* =========================
   BREAKFAST COMING SOON CARD
========================= */
const BreakfastComingSoonCard = memo(() => {
  return (
    <motion.div
      className="
        rounded-2xl shadow-2xl overflow-hidden border-2
        bg-linear-to-br from-[#FFF8E1] to-[#F5F5F5]
        border-yellow-300
        w-full mb-8
      "
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-linear-to-r from-amber-400 to-yellow-400 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="text-4xl">⏳</span>
            <div>
              <h3 className="text-white text-2xl font-bold">
                Breakfast Coming Soon!
              </h3>
              <p className="text-white/90">We're preparing delicious breakfast options for your subscription</p>
            </div>
          </div>
          <button
            onClick={() => toast.success("We'll notify you when breakfast is available!")}
            className="px-6 py-3 rounded-xl bg-white text-amber-600 font-bold hover:bg-white/90 transition-colors"
          >
            🔔 Notify Me
          </button>
        </div>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-gray-800 font-bold text-lg mb-3">What to Expect</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-gray-700">
                <span className="text-green-500">✓</span>
                Healthy breakfast options
              </li>
              <li className="flex items-center gap-2 text-gray-700">
                <span className="text-green-500">✓</span>
                Traditional Indian breakfast items
              </li>
              <li className="flex items-center gap-2 text-gray-700">
                <span className="text-green-500">✓</span>
                Balanced nutrition
              </li>
              <li className="flex items-center gap-2 text-gray-700">
                <span className="text-green-500">✓</span>
                Fresh daily delivery
              </li>
            </ul>
          </div>
          <div className="bg-linear-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-4">
            <h4 className="text-amber-800 font-bold text-lg mb-2">Estimated Features</h4>
            <p className="text-amber-700 text-sm">
              Breakfast thali will include items like Poha, Upma, Idli, Dosa, Paratha, 
              along with fruits, juice, and hot beverages.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

/* =========================
   MAIN PAGE
========================= */
const DiscoverMeals = () => {
  const [meals, setMeals] = useState([]);
  const [filter, setFilter] = useState("lunch");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [currentDayOfSubscription, setCurrentDayOfSubscription] = useState(1);

  // Fetch subscription data
  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/subscriptions/my`,
          { credentials: "include" }
        );

        if (res.ok) {
          const data = await res.json();
          setSubscription(data || null);
          
          // Calculate current day of subscription
          if (data && data.startDate) {
            const start = new Date(data.startDate);
            const today = new Date();
            const day = Math.floor((today - start) / (1000 * 60 * 60 * 24)) + 1;
            setCurrentDayOfSubscription(day > 0 ? day : 1);
          }
        }
      } catch (error) {
        console.error("Failed to fetch subscription", error);
        setSubscription(null);
      }
    };

    fetchSubscription();
  }, []);

  const fetchMeals = useCallback(async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/meals`);
      const data = await res.json();
      setMeals(data);
    } catch (err) {
      console.error("Failed to fetch meals", err);
      setError({ 
        type: "network", 
        message: "Failed to load meals. Please try again." 
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMeals();
  }, [fetchMeals]);

  // Filter meals based on selected meal type (lunch/dinner show only veg)
  const filteredMeals = useMemo(() => {
    if (filter === "breakfast") return []; // Breakfast shows "Coming Soon!"
    return meals.filter((meal) => (meal.category || meal.type) === "veg"); // Lunch and Dinner show only veg
  }, [filter, meals]);

  if (error) {
    return (
      <ErrorState
        type={error.type}
        message={error.message}
        onRetry={() => {
          setLoading(true);
          fetchMeals();
        }}
      />
    );
  }

  if (loading) return <Loader text="Loading meals..." />;

  return (
    <motion.div
      className="bg-linear-to-br from-[#0F2027] via-[#203A43] to-[#2C5364] py-10"
    >
      <motion.div
        className="max-w-7xl mx-auto px-5 my-14 py-10 shadow-2xl bg-linear-to-r from-[#119DA4]/90 to-[#FDE789]/90 rounded-3xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-6 text-center" style={{ color: '#000000' }}>Discover Meals</h1>

        {/* Filters */}
        <div className="flex justify-center gap-4 mb-10">
          {["breakfast", "lunch", "dinner"].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-6 py-2 rounded-full font-medium transition-all duration-300 border ${filter === type
                ? "text-white shadow-md"
                : "border-[rgba(46,204,113,0.25)]"
                }`}
              style={filter === type
                ? { backgroundColor: '#235E3A', color: '#FFFFFF', borderColor: '#235E3A' }
                : { backgroundColor: '#F9F9F9', color: '#666666', borderColor: '#CCCCCC' }
              }
              onMouseEnter={(e) => {
                if (filter !== type) {
                  e.currentTarget.style.backgroundColor = 'rgba(46, 204, 113, 0.2)';
                }
              }}
              onMouseLeave={(e) => {
                if (filter !== type) {
                  e.currentTarget.style.backgroundColor = '#F9F9F9';
                }
              }}
            >
              {type === "breakfast" ? "Breakfast" : type === "lunch" ? "Lunch" : "Dinner"}
            </button>
          ))}
        </div>

        {/* Subscription Thali Display - Only shown if user has active subscription */}
        {subscription && (
          <>
            {filter === "breakfast" ? (
              <BreakfastComingSoonCard />
            ) : filter === "lunch" || filter === "dinner" ? (
              <SubscriptionThaliCard 
                mealType={filter}
                day={currentDayOfSubscription}
                mealData={subscription}
              />
            ) : null}
            
            {/* Separator */}
            {filter !== "breakfast" && (
              <div className="mb-10 pt-8 border-t border-gray-300/30">
                <h2 className="text-2xl font-bold text-center mb-2" style={{ color: '#235E3A' }}>
                  Additional Meals Available
                </h2>
                <p className="text-center text-gray-600 mb-6">
                  Explore more meals to add to your cart beyond your subscription
                </p>
              </div>
            )}
          </>
        )}

        {/* Meals Grid or Coming Soon Message */}
        {filter === "breakfast" ? (
          <div className="text-center py-20">
            <p className="text-3xl font-semibold" style={{ color: '#666666' }}>Coming Soon!</p>
          </div>
        ) : filteredMeals.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg" style={{ color: '#666666' }}>No meals available</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-8 items-start justify-start">
            {filteredMeals.map((meal) => (
              <MealCard key={meal._id} meal={meal} />
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default DiscoverMeals;