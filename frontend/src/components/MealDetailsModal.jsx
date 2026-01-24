import { motion } from "framer-motion";
import { X } from "lucide-react";

const MealDetailsModal = ({ meal, type, onClose }) => {
    if (!meal) return null;

    const macros = meal.macros || {};

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-xl relative"
            >
                {/* Close */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4"
                >
                    <X size={20} />
                </button>

                {/* Header */}
                <h2 className="text-xl font-semibold mb-1">
                    {meal.name}
                </h2>

                <span className="inline-block text-xs px-3 py-1 rounded-full bg-green-100 text-green-700 mb-4">
                    {type === "lunch" ? "Lunch Meal" : "Dinner Meal"}
                </span>

                {/* Items */}
                <div className="mb-4">
                    <h3 className="font-medium mb-2">Included Items</h3>
                    <ul className="space-y-1 text-sm text-gray-700">
                        {meal.items?.map((item, idx) => (
                            <li key={idx}>
                                • {item.name} ({item.quantity})
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Macros */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <p><b>Calories:</b> {macros.calories ?? "N/A"}</p>
                    <p><b>Protein:</b> {macros.protein ?? "N/A"}g</p>
                    <p><b>Carbs:</b> {macros.carbs ?? "N/A"}g</p>
                    <p><b>Fats:</b> {macros.fats ?? "N/A"}g</p>
                </div>
            </motion.div>
        </div>
    );
};

export default MealDetailsModal;
