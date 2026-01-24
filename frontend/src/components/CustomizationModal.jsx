import { useState } from "react";

const CustomizationModal = ({ open, onClose, subscriptionId }) => {
    const [type, setType] = useState("exclude-ingredient");
    const [message, setMessage] = useState("");
    const [preferredDate, setPreferredDate] = useState("");

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
                        type,
                        message,
                        preferredDate,
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
            <div className="bg-white p-6 rounded-2xl w-full max-w-md">
                <h3 className="text-lg font-semibold mb-3">
                    Request Customization
                </h3>

                <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full border rounded-xl p-2 mb-3"
                >
                    <option value="exclude-ingredient">Exclude Ingredient</option>
                    <option value="spice-level">Change Spice Level</option>
                    <option value="portion-size">Portion Size</option>
                    <option value="other">Other</option>
                </select>

                <textarea
                    className="w-full border rounded-xl p-2 mb-3"
                    placeholder="Describe your request..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    maxLength={300}
                />

                <input
                    type="date"
                    className="w-full border rounded-xl p-2 mb-4"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                />

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 border rounded-xl py-2 hover:bg-gray-100 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={submitRequest}
                        className="flex-1 bg-green-700 text-white rounded-xl py-2 hover:bg-green-800 transition"
                    >
                        Send Request
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CustomizationModal;
