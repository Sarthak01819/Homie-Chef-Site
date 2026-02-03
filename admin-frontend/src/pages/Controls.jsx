import { useState } from "react";
import ConfirmActionModal from "../components/ConfirmActionModal";

const Controls = () => {
    const [confirm, setConfirm] = useState(null);
    const [subscription, setSubscription] = useState(null);

    const status = subscription?.status;
    const isPaused = status === "paused";
    const isActive = status === "active";
    const isCancelled = status === "cancelled";

    const [error, setError] = useState(null);

    const run = async (url) => {
        try {
            const res = await fetch(url, {
                method: "POST",
                credentials: "include",
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Action failed");
            }
        } catch (e) {
            setError(e.message);
        } finally {
            setConfirm(null);
        }
    };

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold">Admin Controls</h1>
            {error && (
                <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">
                    {error}
                </div>
            )}

            <button
                disabled={!isActive}
                className={`px-4 py-2 rounded-lg ${isActive ? "bg-yellow-500 text-white" : "bg-gray-300 text-gray-500"
                    }`}
            >
                Pause Subscription
            </button>

            <button
                disabled={!isPaused}
                className={`px-4 py-2 rounded-lg ${isPaused ? "bg-green-600 text-white" : "bg-gray-300 text-gray-500"
                    }`}
            >
                Resume Subscription
            </button>

            <button
                disabled={isCancelled}
                className={`px-4 py-2 rounded-lg ${!isCancelled ? "bg-red-600 text-white" : "bg-gray-300 text-gray-500"
                    }`}
            >
                Cancel Subscription
            </button>

            <ConfirmActionModal
                open={!!confirm}
                title={confirm?.title}
                message={confirm?.message}
                onConfirm={confirm?.action}
                onClose={() => setConfirm(null)}
            />
        </div>
    );
};

export default Controls;
