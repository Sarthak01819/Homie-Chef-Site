import { useEffect, useState } from "react";
import Loader from "../../../frontend/src/components/Loader";

const CustomizationRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const res = await fetch(
                    `${import.meta.env.VITE_API_URL}/admin/customization-requests`,
                    { credentials: "include" }
                );

                if (!res.ok) throw new Error("Failed to load");

                const data = await res.json();
                setRequests(data);
            } catch {
                setError("Could not fetch customization requests");
            } finally {
                setLoading(false);
            }
        };

        fetchRequests();
    }, []);

    if (loading) return <Loader />;
    if (error) return <p className="text-red-600">{error}</p>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">
                Customization Requests
            </h1>

            {requests.length === 0 ? (
                <p className="text-gray-500">
                    No customization requests yet.
                </p>
            ) : (
                <div className="space-y-4">
                    {requests.map((req) => (
                        <div
                            key={req._id}
                            className="border rounded-xl p-4 bg-white shadow-sm"
                        >
                            <div className="flex justify-between mb-2">
                                <div>
                                    <p className="font-semibold">
                                        {req.performedBy?.name}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {req.performedBy?.email}
                                    </p>
                                </div>
                                <span className="text-xs text-gray-500">
                                    {new Date(req.createdAt).toLocaleString()}
                                </span>
                            </div>

                            <p className="text-sm mb-1">
                                <b>Type:</b> {req.meta.type}
                            </p>

                            <p className="text-sm mb-1">
                                <b>Message:</b> {req.meta.message}
                            </p>

                            {req.meta.preferredDate && (
                                <p className="text-sm">
                                    <b>Preferred Date:</b>{" "}
                                    {req.meta.preferredDate}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CustomizationRequests;
