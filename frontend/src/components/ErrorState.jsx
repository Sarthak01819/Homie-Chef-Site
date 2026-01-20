import { WifiOff, AlertTriangle, RefreshCcw } from "lucide-react";

const ErrorState = ({ type = "api", message, onRetry }) => {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
            <div className="mb-4 text-red-500">
                {type === "offline" ? (
                    <WifiOff size={42} />
                ) : (
                    <AlertTriangle size={42} />
                )}
            </div>

            <h2 className="text-xl font-semibold mb-2">
                {type === "offline" ? "You're offline" : "Something went wrong"}
            </h2>

            <p className="text-gray-600 max-w-sm mb-6">
                {message || "Please try again later"}
            </p>

            {onRetry && (
                <button
                    onClick={onRetry}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-linear-to-r from-[#4B0C37] to-[#119DA4] text-white hover:from-[#119DA4] hover:to-[#4B0C37] transition-all duration-300"
                >
                    <RefreshCcw size={16} />
                    Retry
                </button>
            )}
        </div>
    );
};

export default ErrorState;
