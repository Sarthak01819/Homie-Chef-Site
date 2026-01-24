import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import { motion } from "framer-motion";

const Favourites = () => {
    const { user, setUser } = useAuth();
    const navigate = useNavigate();
    const [meals, setMeals] = useState([]);
    const [loading, setLoading] = useState(true);

    // 🔐 Protect route
    useEffect(() => {
        if (!user) {
            navigate("/login");
            return;
        }

        const fetchFavourites = async () => {
            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/meals/favourites`,
                { credentials: "include" }
            );
            const data = await res.json();
            setMeals(Array.isArray(data) ? data : []);
            setLoading(false);
        };

        fetchFavourites();
    }, [user, navigate]);

    const unlikeMeal = async (mealId) => {
        const res = await fetch(
            `${import.meta.env.VITE_API_URL}/meals/${mealId}/favourite`,
            {
                method: "POST",
                credentials: "include",
            }
        );

        const data = await res.json();

        setMeals(meals.filter((m) => m._id !== mealId));
        setUser({ ...user, favourites: data.favourites });
    };

    if (loading) {
        return <Loader text="Loading your cart..." />;
    }

    if (meals.length === 0) {
        return (
            <motion.div
                className="min-h-[60vh] flex items-center justify-center text-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                <div className="text-center">
                    <p className="text-lg font-semibold">No favourites yet ❤️</p>
                    <p className="text-sm text-gray-500 mt-1">
                        Tap the heart icon on meals to save them
                    </p>
                </div>

            </motion.div>
        );
    }

    return (
        <motion.div 
        className="min-h-screen bg-linear-to-br from-[#0F2027] via-[#203A43] to-[#2C5364] py-24"
        >
            <motion.div
                className="max-w-6xl mx-auto px-5 py-10 bg-linear-to-r from-[#119DA4]/90 to-[#FDE789]/90 backdrop-blur-2xl rounded-2xl mt-24 shadow-2xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <motion.h1
                    className="text-3xl font-bold mb-6"
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    Your Favourites
                </motion.h1>

                <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
                    initial="hidden"
                    animate="visible"
                    variants={{
                        hidden: { opacity: 0 },
                        visible: {
                            opacity: 1,
                            transition: {
                                staggerChildren: 0.1,
                                delayChildren: 0.4
                            }
                        }
                    }}
                >
                    {meals.map((meal) => (
                        <motion.div
                            key={meal._id}
                            className="bg-white rounded-2xl shadow p-4 relative"
                            variants={{
                                hidden: { y: 50, opacity: 0 },
                                visible: { y: 0, opacity: 1 }
                            }}
                            whileHover={{ y: -5, transition: { duration: 0.2 } }}
                        >
                            <motion.button
                                onClick={() => unlikeMeal(meal._id)}
                                className="absolute top-3 right-3"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <Heart
                                    className="fill-red-500 text-red-500"
                                    size={22}
                                />
                            </motion.button>

                            <img
                                src={meal.image}
                                alt={meal.name}
                                className="h-40 w-full object-cover rounded-xl mb-3"
                            />

                            <h2 className="font-semibold">{meal.name}</h2>
                            <p className="text-sm text-gray-500">
                                {meal.type === "veg" ? "Veg" : "Non-Veg"} · ₹{meal.price}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>
            </motion.div>
        </motion.div>
    );
};

export default Favourites;
