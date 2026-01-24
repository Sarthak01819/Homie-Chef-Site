import { useEffect, useState } from "react";

const DeliveryLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await fetch(
                    `${import.meta.env.VITE_API_URL}/admin/deliveries`,
                    { credentials: "include" }
                );

                if (!res.ok) throw new Error("Failed to fetch");

                const data = await res.json();
                setLogs(data);
            } catch {
                setError("Could not load delivery logs");
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, []);

    if (loading)
        return (
            <div className="p-6 text-gray-500">
                Loading delivery logs...
            </div>
        );

    if (error) return <p className="text-red-600 p-6">{error}</p>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Delivery Logs</h1>

            {logs.length === 0 ? (
                <p className="text-gray-500">No deliveries logged yet.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-200 rounded-xl overflow-hidden">
                        <thead className="bg-gray-100 text-left">
                            <tr>
                                <th className="p-3 text-sm font-semibold">User</th>
                                <th className="p-3 text-sm font-semibold">Email</th>
                                <th className="p-3 text-sm font-semibold">Subscription</th>
                                <th className="p-3 text-sm font-semibold">Day</th>
                                <th className="p-3 text-sm font-semibold">Meal</th>
                                <th className="p-3 text-sm font-semibold">Delivered At</th>
                            </tr>
                        </thead>

                        <tbody>
                            {logs.map((log) => (
                                <tr
                                    key={log._id}
                                    className="border-t hover:bg-gray-50 transition"
                                >
                                    <td className="p-3">
                                        {log.performedBy?.name || "—"}
                                    </td>
                                    <td className="p-3 text-sm text-gray-600">
                                        {log.performedBy?.email || "—"}
                                    </td>
                                    <td className="p-3 text-xs text-gray-600">
                                        {log.meta.subscriptionId}
                                    </td>
                                    <td className="p-3 text-center">
                                        {log.meta.day}
                                    </td>
                                    <td className="p-3 capitalize">
                                        {log.meta.mealType}
                                    </td>
                                    <td className="p-3 text-sm">
                                        {new Date(
                                            log.meta.deliveredAt || log.createdAt
                                        ).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default DeliveryLogs;
