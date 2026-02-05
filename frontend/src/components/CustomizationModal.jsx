import { useState, useEffect } from "react";

const CustomizationModal = ({ open, onClose, subscriptionId }) => {
    const [mealType, setMealType] = useState("lunch"); // Default to lunch
    const [type, setType] = useState("exclude-ingredient");
    const [message, setMessage] = useState("");
    const [nextDate, setNextDate] = useState("");

    // Get tomorrow's date
    useEffect(() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const formattedDate = tomorrow.toISOString().split('T')[0];
        setNextDate(formattedDate);
    }, []);

    const submitRequest = async () => {
        if (!message.trim()) return;

        try {
            await fetch(
                `${import.meta.env.VITE_API_URL}/admin/customization-requests`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({
                        subscriptionId,
                        mealType, // Added meal type
                        type,
                        message,
                        preferredDate: nextDate, // Use nextDate
                    }),
                }
            );

            onClose();
            alert("Customization request sent to Homie Chef 👍");
        } catch {
            alert("Failed to send request. Try again.");
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-2xl w-full max-w-md bg-linear-to-br from-blue-600/40 to-blue-50">
                <h3 className="text-xl font-bold mb-3">
                    Request Customization
                </h3>

                {/* Meal Type Selection */}
                <div className="mb-4">
                    <label className="block text-sm font-semibold text-black mb-1">
                        Select Meal
                    </label>
                    <div className="relative">
                        <select
                            value={mealType}
                            onChange={(e) => setMealType(e.target.value)}
                            className="w-full border rounded-xl p-2 bg-white appearance-none"
                        >
                            <option 
                                value="breakfast" 
                                disabled 
                                className="text-gray-400 bg-gray-100"
                            >
                                🍳 Breakfast (Coming Soon)
                            </option>
                            <option value="lunch" className="text-gray-900">
                                🍽️ Lunch
                            </option>
                            <option value="dinner" className="text-gray-900">
                                🌙 Dinner
                            </option>
                        </select>
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                    {/* <p className="text-xs text-black mt-1">
                        Breakfast customization will be available soon
                    </p> */}
                </div>

                {/* Customization Type */}
                <div className="mb-3">
                    <label className="block text-sm font-semibold text-black mb-1">
                        Customization Type
                    </label>
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="w-full border rounded-xl p-2 bg-white"
                    >
                        <option value="exclude-ingredient">Exclude Ingredient</option>
                        {/* <option value="spice-level">Change Spice Level</option>
                        <option value="portion-size">Portion Size</option> */}
                        <option value="other">Other</option>
                    </select>
                    <p className="text-sm font-medium text-black my-1">
                        NOTE: To add more items, please go to "
                        <span className="font-bold text-red-700">Discover</span>
                        " option
                    </p>
                </div>

                {/* Message */}
                <div className="mb-4">
                    <label className="block text-sm font-semibold text-black mb-1">
                        Description
                    </label>
                    <textarea
                        className="w-full border rounded-xl p-2 bg-white"
                        placeholder={`Describe your ${mealType} customization request...`}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        maxLength={300}
                        rows={4}
                    />
                    <div className="text-xs text-gray-500 mt-1 text-right">
                        {message.length}/300 characters
                    </div>
                </div>

                {/* Next Date Display */}
                <div className="mb-6 p-3 bg-gray-50 rounded-xl border">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm font-medium text-gray-700">
                                Change will take effect on:
                            </div>
                            <div className="text-lg font-bold text-green-700">
                                {nextDate ? new Date(nextDate).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                }) : 'Loading...'}
                            </div>
                        </div>
                        <div className="text-3xl">📅</div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        Customizations require at least one day to process
                    </p>
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 border border-gray-300 rounded-xl py-2 hover:bg-gray-100 transition text-gray-700 font-medium bg-white cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={submitRequest}
                        disabled={!message.trim()}
                        className={`flex-1 rounded-xl py-2 transition font-medium ${!message.trim()
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "bg-green-700 text-white hover:bg-green-800"
                            }`}
                    >
                        Send Request
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CustomizationModal;