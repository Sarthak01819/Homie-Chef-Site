import { useEffect, useState } from "react";

const DeliveryLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    const [date, setDate] = useState("");
    const [mealType, setMealType] = useState("");
    const [email, setEmail] = useState("");

    const fetchLogs = async () => {
        setLoading(true);

        const params = new URLSearchParams();
        if (date) params.append("date", date);
        if (mealType) params.append("mealType", mealType);
        if (email) params.append("email", email);

        const res = await fetch(
            `${import.meta.env.VITE_API_URL}/admin/deliveries?${params.toString()}`,
            { credentials: "include" }
        );

        const data = await res.json();
        setLogs(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    useEffect(() => {
        const handler = (e) => {
            if (e.detail.type === "MEAL_DELIVERED") {
                fetchLogs();
            }
        };

        window.addEventListener("ADMIN_UPDATE", handler);
        return () =>
            window.removeEventListener("ADMIN_UPDATE", handler);
    }, []);

    return (
        <div className="p-6 space-y-6 bg-green-100">
            <h1 className="text-2xl font-bold">Delivery Control Panel</h1>

            {/* 🔍 Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded-xl border">
                <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="border rounded-lg px-3 py-2"
                />

                <select
                    value={mealType}
                    onChange={(e) => setMealType(e.target.value)}
                    className="border rounded-lg px-3 py-2"
                >
                    <option value="">All Meals</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                </select>

                <input
                    type="text"
                    placeholder="User email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border rounded-lg px-3 py-2"
                />

                <button
                    onClick={fetchLogs}
                    className="bg-black text-white rounded-lg px-4 py-2"
                >
                    Apply Filters
                </button>
            </div>

            {/* 📊 Table */}
            {loading ? (
                <p className="text-gray-500">Loading deliveries…</p>
            ) : logs.length === 0 ? (
                <p className="text-gray-500">No deliveries found.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border rounded-xl overflow-hidden">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-3 text-left text-sm">User</th>
                                <th className="p-3 text-left text-sm">Email</th>
                                <th className="p-3 text-center text-sm">Day</th>
                                <th className="p-3 text-center text-sm">Meal</th>
                                <th className="p-3 text-left text-sm">Delivered At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map((log) => (
                                <tr key={log._id} className="border-t">
                                    <td className="p-3">
                                        {log.performedBy?.name || "—"}
                                    </td>
                                    <td className="p-3 text-sm text-gray-600">
                                        {log.performedBy?.email || "—"}
                                    </td>
                                    <td className="p-3 text-center">
                                        {log.metadata.day}
                                    </td>
                                    <td className="p-3 text-center capitalize">
                                        {log.metadata.mealType}
                                    </td>
                                    <td className="p-3 text-sm">
                                        {new Date(
                                            log.metadata.deliveredAt || log.createdAt
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
