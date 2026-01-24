import { motion } from "framer-motion";
import { X } from "lucide-react";

const MealDetailsSheet = ({ meal, type, onClose }) => {
    if (!meal) return null;

    const macros = meal.macros || {};

    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end">
            <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ duration: 0.3 }}
                className="bg-white w-full rounded-t-3xl p-6"
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">{meal.name}</h2>
                    <button onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <span className="inline-block text-xs px-3 py-1 rounded-full bg-green-100 text-green-700 mb-4">
                    {type === "lunch" ? "Lunch Meal" : "Dinner Meal"}
                </span>

                <h3 className="font-medium mb-2">Included Items</h3>
                <ul className="space-y-1 text-sm mb-4">
                    {meal.items?.map((item, idx) => (
                        <li key={idx}>
                            • {item.name} ({item.quantity})
                        </li>
                    ))}
                </ul>

                <div className="grid grid-cols-2 gap-4 text-sm">
                    <p><b>Calories:</b> {macros.calories}</p>
                    <p><b>Protein:</b> {macros.protein}g</p>
                    <p><b>Carbs:</b> {macros.carbs}g</p>
                    <p><b>Fats:</b> {macros.fats}g</p>
                </div>
            </motion.div>
        </div>
    );
};

export default MealDetailsSheet;
